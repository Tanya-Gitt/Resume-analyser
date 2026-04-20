import re
from collections import Counter
import spacy

nlp = spacy.load("en_core_web_sm")


def _lemmatize_text(text: str) -> list[str]:
    doc = nlp(text.lower())
    return [
        token.lemma_
        for token in doc
        if not token.is_stop and not token.is_punct and token.is_alpha and len(token.text) > 2
    ]


def _lemmatize_phrase(phrase: str) -> str:
    doc = nlp(phrase.lower())
    tokens = [token.lemma_ for token in doc if not token.is_punct]
    return " ".join(tokens).strip()


def _match_keyword(keyword: str, resume_text_lower: str, resume_lemmas: list[str]) -> int:
    """
    Returns occurrence count of keyword in resume, or 0 if not found.
    Uses word-boundary matching to avoid false positives (e.g. 'java' in 'javascript').
    Handles both single-word and multi-word keywords.
    """
    keyword_clean = keyword.strip()
    if not keyword_clean:
        return 0

    keyword_lemma = _lemmatize_phrase(keyword_clean)
    words_in_keyword = keyword_lemma.split()

    if len(words_in_keyword) == 1:
        # Single-word: match lemma against resume lemma list with word boundary in raw text
        # Use word boundary on the original keyword in the raw resume text
        pattern = r'\b' + re.escape(keyword_clean.lower()) + r'\b'
        raw_count = len(re.findall(pattern, resume_text_lower))

        # Also count via lemma list for morphological variants
        lemma_count = resume_lemmas.count(keyword_lemma)

        return max(raw_count, lemma_count)
    else:
        # Multi-word phrase: search in raw lowercased text with word boundaries
        pattern = r'\b' + r'\s+'.join(re.escape(w) for w in keyword_clean.lower().split()) + r'\b'
        raw_count = len(re.findall(pattern, resume_text_lower))

        # Also try lemmatized phrase in the lemma joined string
        lemma_joined = " ".join(resume_lemmas)
        lemma_pattern = r'\b' + re.escape(keyword_lemma) + r'\b'
        lemma_count = len(re.findall(lemma_pattern, lemma_joined))

        return max(raw_count, lemma_count)


def analyze_resume(
    resume_text: str,
    must_have_keywords: list[str],
    nice_to_have_keywords: list[str] | None = None,
) -> dict:
    """
    Analyze a resume against must-have and nice-to-have keyword lists.

    Scoring:
      - Must-have keywords contribute 70% of total score
      - Nice-to-have keywords contribute 30%
      - If no nice-to-have keywords, 100% weight is on must-have
    """
    if nice_to_have_keywords is None:
        nice_to_have_keywords = []

    resume_text_lower = resume_text.lower()
    resume_lemmas = _lemmatize_text(resume_text)

    def _process_group(keywords: list[str]) -> tuple[dict, list[str]]:
        matches: dict[str, int] = {}
        missing: list[str] = []
        for kw in keywords:
            kw = kw.strip()
            if not kw:
                continue
            count = _match_keyword(kw, resume_text_lower, resume_lemmas)
            if count > 0:
                matches[kw] = count
            else:
                missing.append(kw)
        return matches, missing

    must_matches, must_missing = _process_group(must_have_keywords)
    nice_matches, nice_missing = _process_group(nice_to_have_keywords)

    # Weighted score
    has_nice = len(nice_to_have_keywords) > 0
    must_weight = 0.7 if has_nice else 1.0
    nice_weight = 0.3 if has_nice else 0.0

    must_score = (len(must_matches) / len(must_have_keywords) * 100) if must_have_keywords else 0
    nice_score = (len(nice_matches) / len(nice_to_have_keywords) * 100) if nice_to_have_keywords else 0

    total_score = round(must_weight * must_score + nice_weight * nice_score, 1)

    return {
        "score": total_score,
        "must_score": round(must_score, 1),
        "nice_score": round(nice_score, 1),
        "must_matches": must_matches,
        "must_missing": must_missing,
        "nice_matches": nice_matches,
        "nice_missing": nice_missing,
    }


def extract_keywords_from_jd(job_description: str) -> list[str]:
    """Extract noun/adjective keywords from job description using spaCy."""
    doc = nlp(job_description.lower())
    keywords = list({
        token.lemma_
        for token in doc
        if not token.is_stop and not token.is_punct and token.is_alpha
        and len(token.text) > 2 and token.pos_ in ("NOUN", "ADJ", "PROPN")
    })
    return sorted(keywords)
