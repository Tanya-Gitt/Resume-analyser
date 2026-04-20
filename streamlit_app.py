import io
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st

from keyword_matcher import analyze_resume, extract_keywords_from_jd
from resume_parser import extract_text_from_file

# ─── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(
    page_title="Resume Analyser",
    page_icon="📋",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ─── Custom CSS ───────────────────────────────────────────────────────────────
st.markdown("""
<style>
  /* ── Global ── */
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
  html, body, [class*="css"] { font-family: 'Inter', sans-serif; }

  /* ── Hero banner ── */
  .hero {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    border-radius: 16px;
    padding: 40px 48px;
    margin-bottom: 28px;
    color: #fff;
  }
  .hero h1 { font-size: 2.4rem; font-weight: 700; margin: 0 0 8px; letter-spacing: -0.5px; }
  .hero p  { font-size: 1.05rem; opacity: 0.75; margin: 0; }

  /* ── Score badge ── */
  .badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.85rem;
  }
  .badge-green  { background:#d1fae5; color:#065f46; }
  .badge-yellow { background:#fef3c7; color:#92400e; }
  .badge-red    { background:#fee2e2; color:#991b1b; }

  /* ── Candidate card ── */
  .cand-card {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 18px 22px;
    margin-bottom: 14px;
    background: #fff;
    transition: box-shadow .2s;
  }
  .cand-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,.08); }
  .cand-name { font-size: 1rem; font-weight: 600; color: #1e293b; margin-bottom: 6px; }
  .cand-score { font-size: 2rem; font-weight: 700; }
  .score-green  { color: #10b981; }
  .score-yellow { color: #f59e0b; }
  .score-red    { color: #ef4444; }

  /* ── Sidebar tweaks ── */
  [data-testid="stSidebar"] { background: #0f172a; }
  [data-testid="stSidebar"] * { color: #cbd5e1 !important; }
  [data-testid="stSidebar"] h2,
  [data-testid="stSidebar"] h3 { color: #f8fafc !important; font-weight: 600; }
  [data-testid="stSidebar"] .stTextArea textarea,
  [data-testid="stSidebar"] .stTextInput input {
    background: #1e293b !important;
    border: 1px solid #334155 !important;
    border-radius: 8px;
    color: #f1f5f9 !important;
  }
  [data-testid="stSidebar"] .stButton > button {
    width: 100%;
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    color: #fff !important;
    border: none;
    border-radius: 8px;
    padding: 10px;
    font-weight: 600;
    font-size: 0.95rem;
    margin-top: 8px;
    cursor: pointer;
  }
  [data-testid="stSidebar"] .stButton > button:hover {
    background: linear-gradient(135deg, #4f46e5, #7c3aed);
  }

  /* ── Metric overrides ── */
  [data-testid="stMetric"] {
    background: #f8fafc;
    border-radius: 10px;
    padding: 16px;
    border: 1px solid #e2e8f0;
  }
  [data-testid="stMetricValue"] { font-weight: 700; font-size: 1.6rem !important; }

  /* ── Tab ── */
  .stTabs [data-baseweb="tab-list"] { gap: 8px; }
  .stTabs [data-baseweb="tab"] {
    border-radius: 8px 8px 0 0;
    font-weight: 500;
    padding: 10px 20px;
  }

  /* ── Skill chip ── */
  .chip {
    display:inline-block;
    margin:3px 4px;
    padding:4px 11px;
    border-radius:16px;
    font-size:0.8rem;
    font-weight:500;
  }
  .chip-match { background:#d1fae5; color:#065f46; }
  .chip-miss  { background:#fee2e2; color:#991b1b; }
  .chip-nice  { background:#dbeafe; color:#1e40af; }
  .chip-nice-miss { background:#fef9c3; color:#854d0e; }

  /* ── Info box ── */
  .info-box {
    background: #eff6ff;
    border-left: 4px solid #3b82f6;
    border-radius: 0 8px 8px 0;
    padding: 14px 18px;
    margin: 16px 0;
    font-size: 0.9rem;
    color: #1e40af;
  }
</style>
""", unsafe_allow_html=True)

# ─── Hero ─────────────────────────────────────────────────────────────────────
st.markdown("""
<div class="hero">
  <h1>📋 Resume Analyser</h1>
  <p>Upload resumes, define requirements, and instantly rank candidates — powered by NLP keyword matching.</p>
</div>
""", unsafe_allow_html=True)

# ─── Session state ─────────────────────────────────────────────────────────────
if "results" not in st.session_state:
    st.session_state.results = []
if "must_keywords" not in st.session_state:
    st.session_state.must_keywords = []
if "nice_keywords" not in st.session_state:
    st.session_state.nice_keywords = []

# ─── Sidebar ──────────────────────────────────────────────────────────────────
with st.sidebar:
    st.markdown("## ⚙️ Configuration")
    st.markdown("---")

    st.markdown("### 📄 Job Description")
    job_description = st.text_area(
        "Paste the job description:",
        height=180,
        placeholder="Senior Python engineer with 3+ years experience in FastAPI, PostgreSQL, and AWS...",
        label_visibility="collapsed",
    )

    if job_description and st.button("🔍 Auto-extract keywords"):
        extracted = extract_keywords_from_jd(job_description)
        st.session_state.must_keywords = extracted
        st.success(f"Extracted {len(extracted)} keywords")

    st.markdown("### 🔑 Must-Have Keywords")
    must_raw = st.text_area(
        "Must-have (comma-separated):",
        value=", ".join(st.session_state.must_keywords),
        height=100,
        placeholder="python, sql, rest api, docker",
        label_visibility="collapsed",
    )

    st.markdown("### ✨ Nice-to-Have Keywords")
    nice_raw = st.text_area(
        "Nice-to-have (comma-separated):",
        height=80,
        placeholder="kubernetes, terraform, react",
        label_visibility="collapsed",
    )

    st.markdown("### 📂 Upload Resumes")
    uploaded_files = st.file_uploader(
        "PDF, DOCX, or TXT files:",
        type=["pdf", "docx", "txt"],
        accept_multiple_files=True,
        label_visibility="collapsed",
    )

    st.markdown("### 🎚️ Score Threshold")
    threshold = st.slider("Show candidates above:", 0, 100, 0, 5, format="%d%%")

    run_btn = st.button("▶ Analyse Resumes")

# ─── Parse keywords ───────────────────────────────────────────────────────────
must_keywords = [k.strip() for k in must_raw.split(",") if k.strip()] if must_raw else []
nice_keywords = [k.strip() for k in nice_raw.split(",") if k.strip()] if nice_raw else []

# ─── Processing ───────────────────────────────────────────────────────────────
if run_btn:
    if not uploaded_files:
        st.warning("Please upload at least one resume.")
    elif not must_keywords:
        st.warning("Please add at least one must-have keyword or auto-extract from the job description.")
    else:
        results = []
        prog = st.progress(0, text="Analysing resumes…")
        status = st.empty()

        for i, f in enumerate(uploaded_files):
            status.markdown(f"Processing **{f.name}**…")
            text = extract_text_from_file(f)
            if text is None:
                st.error(f"Could not read **{f.name}** — skipping.")
                continue

            analysis = analyze_resume(text, must_keywords, nice_keywords)
            results.append({
                "name": f.name,
                "text": text,
                **analysis,
            })
            prog.progress((i + 1) / len(uploaded_files), text="Analysing resumes…")

        prog.empty()
        status.empty()
        st.session_state.results = results
        st.session_state.must_keywords = must_keywords
        st.session_state.nice_keywords = nice_keywords

        if results:
            st.success(f"✅ Analysed {len(results)} resume(s) successfully.")

# ─── Results ──────────────────────────────────────────────────────────────────
results = st.session_state.results

if not results:
    st.markdown("""
<div class="info-box">
👈 <strong>Get started:</strong> paste a job description, add keywords (or auto-extract), upload resumes, then click <strong>Analyse Resumes</strong>.
</div>
""", unsafe_allow_html=True)

    with st.expander("ℹ️ How scoring works"):
        st.markdown("""
**Must-Have keywords** account for **70%** of the score.
**Nice-to-Have keywords** account for the remaining **30%**.
If no nice-to-have keywords are provided, the score is based 100% on must-have matches.

The matcher uses:
- **Word-boundary regex** to avoid false positives (e.g. "Java" won't match "JavaScript")
- **Lemmatization** so "managing" matches "manage" and "managed"
- **Table extraction** from DOCX files so skills in formatted tables aren't missed
""")
    st.stop()

# Filter by threshold
df = pd.DataFrame(results)
df = df[df["score"] >= threshold].sort_values("score", ascending=False).reset_index(drop=True)

if df.empty:
    st.warning(f"No candidates scored {threshold}% or above. Lower the threshold to see results.")
    st.stop()

# ─── Summary metrics ──────────────────────────────────────────────────────────
qualified = df[df["score"] >= 70]
c1, c2, c3, c4, c5 = st.columns(5)
c1.metric("Resumes", len(df))
c2.metric("Avg Score", f"{df['score'].mean():.1f}%")
c3.metric("Top Score", f"{df['score'].max():.1f}%")
c4.metric("Qualified (≥70%)", len(qualified))
c5.metric("Must-have Keywords", len(must_keywords))

# ─── Tabs ─────────────────────────────────────────────────────────────────────
tab_overview, tab_candidates, tab_skills, tab_export = st.tabs([
    "📊 Overview", "👤 Candidates", "🔍 Skills Matrix", "⬇️ Export"
])

# ── Tab 1: Overview ───────────────────────────────────────────────────────────
with tab_overview:
    col_left, col_right = st.columns([3, 2])

    with col_left:
        st.subheader("Candidate Rankings")

        def score_color(s):
            return "#10b981" if s >= 70 else "#f59e0b" if s >= 40 else "#ef4444"

        fig_bar = go.Figure()
        fig_bar.add_trace(go.Bar(
            y=df["name"],
            x=df["score"],
            orientation="h",
            marker_color=[score_color(s) for s in df["score"]],
            text=[f"{s}%" for s in df["score"]],
            textposition="outside",
            hovertemplate="<b>%{y}</b><br>Score: %{x}%<extra></extra>",
        ))
        avg = df["score"].mean()
        fig_bar.add_vline(x=avg, line_dash="dash", line_color="#6366f1",
                          annotation_text=f"Avg {avg:.1f}%", annotation_position="top right")
        fig_bar.add_vline(x=70, line_dash="dot", line_color="#10b981",
                          annotation_text="70% threshold", annotation_position="bottom right")
        fig_bar.update_layout(
            xaxis=dict(range=[0, 110], title="Score (%)"),
            yaxis=dict(title=""),
            margin=dict(l=0, r=60, t=20, b=20),
            height=max(300, len(df) * 48),
            plot_bgcolor="#f8fafc",
            paper_bgcolor="rgba(0,0,0,0)",
        )
        st.plotly_chart(fig_bar, use_container_width=True)

    with col_right:
        st.subheader("Score Distribution")
        bins = [
            ("Strong (≥70%)", len(df[df["score"] >= 70]), "#10b981"),
            ("Moderate (40–69%)", len(df[(df["score"] >= 40) & (df["score"] < 70)]), "#f59e0b"),
            ("Weak (<40%)", len(df[df["score"] < 40]), "#ef4444"),
        ]
        labels, values, colors = zip(*[(b[0], b[1], b[2]) for b in bins])
        fig_pie = go.Figure(go.Pie(
            labels=labels, values=values,
            marker_colors=colors,
            hole=0.5,
            textinfo="label+value",
            hovertemplate="%{label}: %{value} candidate(s)<extra></extra>",
        ))
        fig_pie.update_layout(
            margin=dict(l=0, r=0, t=20, b=20),
            showlegend=False,
            paper_bgcolor="rgba(0,0,0,0)",
        )
        st.plotly_chart(fig_pie, use_container_width=True)

        st.subheader("Top Candidate")
        top = df.iloc[0]
        css_cls = "score-green" if top["score"] >= 70 else "score-yellow" if top["score"] >= 40 else "score-red"
        st.markdown(f"""
<div class="cand-card">
  <div class="cand-name">🏆 {top['name']}</div>
  <div class="cand-score {css_cls}">{top['score']}%</div>
  <small>Must-Have: {top['must_score']}% &nbsp;|&nbsp; Nice-to-Have: {top['nice_score']}%</small>
</div>
""", unsafe_allow_html=True)

# ── Tab 2: Candidates ──────────────────────────────────────────────────────────
with tab_candidates:
    st.subheader("Candidate Details")

    for _, row in df.iterrows():
        score = row["score"]
        css_cls = "score-green" if score >= 70 else "score-yellow" if score >= 40 else "score-red"
        badge_cls = "badge-green" if score >= 70 else "badge-yellow" if score >= 40 else "badge-red"
        verdict = "Strong Match" if score >= 70 else "Moderate Match" if score >= 40 else "Weak Match"

        with st.expander(f"**{row['name']}** — {score}%", expanded=False):
            col_score, col_detail = st.columns([1, 3])

            with col_score:
                # Gauge chart
                fig_gauge = go.Figure(go.Indicator(
                    mode="gauge+number",
                    value=score,
                    number={"suffix": "%", "font": {"size": 28}},
                    gauge={
                        "axis": {"range": [0, 100], "tickwidth": 1},
                        "bar": {"color": "#10b981" if score >= 70 else "#f59e0b" if score >= 40 else "#ef4444"},
                        "steps": [
                            {"range": [0, 40], "color": "#fee2e2"},
                            {"range": [40, 70], "color": "#fef3c7"},
                            {"range": [70, 100], "color": "#d1fae5"},
                        ],
                        "threshold": {"line": {"color": "#6366f1", "width": 3}, "thickness": 0.8, "value": 70},
                    },
                ))
                fig_gauge.update_layout(height=200, margin=dict(l=10, r=10, t=10, b=10),
                                        paper_bgcolor="rgba(0,0,0,0)")
                st.plotly_chart(fig_gauge, use_container_width=True)

                st.markdown(f'<span class="badge {badge_cls}">{verdict}</span>', unsafe_allow_html=True)
                st.markdown(f"**Must-Have:** {row['must_score']}%")
                if nice_keywords:
                    st.markdown(f"**Nice-to-Have:** {row['nice_score']}%")

            with col_detail:
                if row["must_matches"]:
                    st.markdown("**✅ Must-Have Matched:**")
                    chips = " ".join(
                        f'<span class="chip chip-match">{k} ×{v}</span>'
                        for k, v in row["must_matches"].items()
                    )
                    st.markdown(chips, unsafe_allow_html=True)

                if row["must_missing"]:
                    st.markdown("**❌ Must-Have Missing:**")
                    chips = " ".join(f'<span class="chip chip-miss">{k}</span>' for k in row["must_missing"])
                    st.markdown(chips, unsafe_allow_html=True)

                if nice_keywords:
                    if row["nice_matches"]:
                        st.markdown("**💙 Nice-to-Have Matched:**")
                        chips = " ".join(
                            f'<span class="chip chip-nice">{k} ×{v}</span>'
                            for k, v in row["nice_matches"].items()
                        )
                        st.markdown(chips, unsafe_allow_html=True)

                    if row["nice_missing"]:
                        st.markdown("**⚠️ Nice-to-Have Missing:**")
                        chips = " ".join(f'<span class="chip chip-nice-miss">{k}</span>' for k in row["nice_missing"])
                        st.markdown(chips, unsafe_allow_html=True)

                st.markdown("**Resume Preview:**")
                preview = row["text"][:500] + ("…" if len(row["text"]) > 500 else "")
                st.text(preview)

# ── Tab 3: Skills Matrix ───────────────────────────────────────────────────────
with tab_skills:
    st.subheader("Skills Coverage Matrix")

    all_must = must_keywords
    all_nice = nice_keywords

    if not all_must:
        st.info("No keywords to display.")
    else:
        # Must-have heatmap
        must_matrix = []
        for _, row in df.iterrows():
            must_matrix.append([
                1 if kw in row["must_matches"] else 0
                for kw in all_must
            ])

        fig_heat = go.Figure(go.Heatmap(
            z=must_matrix,
            x=all_must,
            y=df["name"].tolist(),
            colorscale=[[0, "#fee2e2"], [1, "#10b981"]],
            showscale=False,
            text=[["✓" if v == 1 else "✗" for v in row] for row in must_matrix],
            texttemplate="%{text}",
            hovertemplate="<b>%{y}</b><br>%{x}: %{text}<extra></extra>",
        ))
        fig_heat.update_layout(
            title="Must-Have Keywords",
            xaxis=dict(side="top"),
            margin=dict(l=0, r=0, t=80, b=0),
            height=max(250, len(df) * 40 + 80),
            paper_bgcolor="rgba(0,0,0,0)",
        )
        st.plotly_chart(fig_heat, use_container_width=True)

        if all_nice:
            nice_matrix = []
            for _, row in df.iterrows():
                nice_matrix.append([
                    1 if kw in row["nice_matches"] else 0
                    for kw in all_nice
                ])
            fig_nice = go.Figure(go.Heatmap(
                z=nice_matrix,
                x=all_nice,
                y=df["name"].tolist(),
                colorscale=[[0, "#fef3c7"], [1, "#3b82f6"]],
                showscale=False,
                text=[["✓" if v == 1 else "✗" for v in row] for row in nice_matrix],
                texttemplate="%{text}",
                hovertemplate="<b>%{y}</b><br>%{x}: %{text}<extra></extra>",
            ))
            fig_nice.update_layout(
                title="Nice-to-Have Keywords",
                xaxis=dict(side="top"),
                margin=dict(l=0, r=0, t=80, b=0),
                height=max(250, len(df) * 40 + 80),
                paper_bgcolor="rgba(0,0,0,0)",
            )
            st.plotly_chart(fig_nice, use_container_width=True)

        # Skill gap bar
        st.subheader("Keyword Coverage Across All Candidates")
        coverage = {}
        for kw in all_must:
            coverage[kw] = sum(1 for _, row in df.iterrows() if kw in row["must_matches"])

        cov_df = pd.DataFrame({"Keyword": list(coverage.keys()), "Count": list(coverage.values())})
        cov_df["Pct"] = (cov_df["Count"] / len(df) * 100).round(1)
        cov_df = cov_df.sort_values("Pct")

        fig_cov = px.bar(
            cov_df, x="Pct", y="Keyword", orientation="h",
            labels={"Pct": "% of candidates with this skill", "Keyword": ""},
            color="Pct",
            color_continuous_scale=["#ef4444", "#f59e0b", "#10b981"],
            range_color=[0, 100],
            text=cov_df["Pct"].apply(lambda x: f"{x}%"),
        )
        fig_cov.update_traces(textposition="outside")
        fig_cov.update_layout(
            coloraxis_showscale=False,
            margin=dict(l=0, r=60, t=20, b=20),
            height=max(300, len(all_must) * 36),
            plot_bgcolor="#f8fafc",
            paper_bgcolor="rgba(0,0,0,0)",
        )
        st.plotly_chart(fig_cov, use_container_width=True)

# ── Tab 4: Export ─────────────────────────────────────────────────────────────
with tab_export:
    st.subheader("Export Results")

    # Build flat export DataFrame
    export_rows = []
    for _, row in df.iterrows():
        export_rows.append({
            "Candidate": row["name"],
            "Overall Score (%)": row["score"],
            "Must-Have Score (%)": row["must_score"],
            "Nice-to-Have Score (%)": row["nice_score"],
            "Must-Have Matched": ", ".join(row["must_matches"].keys()),
            "Must-Have Missing": ", ".join(row["must_missing"]),
            "Nice-to-Have Matched": ", ".join(row["nice_matches"].keys()),
            "Nice-to-Have Missing": ", ".join(row["nice_missing"]),
        })
    export_df = pd.DataFrame(export_rows)

    st.dataframe(export_df, use_container_width=True)

    csv_bytes = export_df.to_csv(index=False).encode("utf-8")
    st.download_button(
        label="⬇️ Download CSV",
        data=csv_bytes,
        file_name="resume_analysis_results.csv",
        mime="text/csv",
    )

    st.markdown("---")
    st.markdown("**Keywords used in this analysis:**")
    c1, c2 = st.columns(2)
    with c1:
        st.markdown("**Must-Have:**")
        for kw in must_keywords:
            st.markdown(f"- {kw}")
    with c2:
        if nice_keywords:
            st.markdown("**Nice-to-Have:**")
            for kw in nice_keywords:
                st.markdown(f"- {kw}")

# ─── Footer ───────────────────────────────────────────────────────────────────
st.markdown("---")
st.markdown(
    "<p style='text-align:center;color:#94a3b8;font-size:0.8rem;'>Resume Analyser · Built with Streamlit & spaCy</p>",
    unsafe_allow_html=True,
)
