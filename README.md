# 🎓 Elective Course Advisor — Decision-Support System

An intelligent academic decision-support application built for college students to discover their **top three conflict-free elective combinations** based on career goals, completed prerequisites, workload preferences, and academic rules.

Runs 100% client-side in the browser with **zero backend** or paid API requirements.

---

## 🌟 Key Features

1. **Top 3 Recommended Combinations (Not Just Individual Courses)**:
   - **Recommendation 1 (Best Match)**: Strongest direct synergy with target career goals and complementary technical skills.
   - **Recommendation 2 (Balanced Choice)**: Broader cross-domain exposure (e.g. AI + Cloud) for market versatility.
   - **Recommendation 3 (Manageable Workload)**: Sustainable weekly pacing, lower cognitive stress, and CGPA defense.

2. **Strict Academic Constraint Solver**:
   - **Prerequisite Validation**: Eliminates courses requiring subjects the student has not yet cleared.
   - **Timetable Conflict Detection**: Prevents scheduling clashes between overlapping lecture slots.
   - **Elective Quota Enforcement**: Strictly satisfies required elective type counts (e.g. *2 Professional + 1 Open*).

3. **Explainable Recommendations & Trade-Off Analysis**:
   - Explicitly explains **why** each combination was chosen and **what the student gives up** (sacrifices, missing domain exposure, or vulnerable subject warnings).
   - Side-by-side **Trade-off Comparison Matrix** comparing scores, hours, difficulty, and domain coverage.

4. **Edge Case & Unmet Needs Diagnostic Engine**:
   - Clearly distinguishes between:
     - **No Valid Combination Exists**: Academic barriers (prerequisite gaps or strict slot clashes) prevent fulfilling the required quota.
     - **Partial Match with Trade-offs**: Student can legally register, but preferences (e.g. Low Workload with advanced AI) require compromises.

5. **Batch Evaluation Dashboard (100 Students Tested)**:
   - Evaluates the recommendation engine across all 100 benchmark student profiles.
   - Verifies **100% Constraint Validity** (0 prerequisite violations, 0 timetable clashes in final recommendations).
   - Filterable audit table with 1-click student inspection and CSV report export.

6. **Interactive What-If Sandbox**:
   - Mix & match electives dynamically with real-time timetable conflict detection, prerequisite checking, and live score recalculation on a Monday–Friday schedule visualizer.

---

## 🛠️ Tech Stack

- **Frontend**: React 19 + Vite 8 + TypeScript
- **Styling**: Tailwind CSS v4 (Warm, modern student portal aesthetic)
- **Icons**: Lucide React
- **CSV Engine**: PapaParse (Client-side in-browser parsing and export)
- **Execution Mode**: 100% Browser memory / client-side execution (No server or external keys needed)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or pnpm

### Installation & Run

```bash
# 1. Clone repository
git clone https://github.com/sreyans20/Elective-Course-Advisor.git
cd Elective-Course-Advisor

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

Open [http://localhost:5173/](http://localhost:5173/) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## 📊 Benchmark Datasets

The repository includes preloaded benchmark datasets meeting the hackathon specifications:
- **`Electives.csv`**: 24 diverse college electives across CS, AI, Cloud, Data Science, Web, Cybersecurity, IoT, Design, Management, and FinTech.
- **`Students.csv`**: 100 realistic student profiles with varied CGPAs, career objectives, cleared prerequisites, weak subjects, and quota demands.

Custom CSVs can be uploaded directly via the in-app **Data & Weights** modal.
