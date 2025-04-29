## Project Overview

This repository contains three Jupyter Notebooks that summarize my major projects:

---

### RCM Dashboard (R Shiny Project)

Developed an interactive Revenue Cycle Management (RCM) dashboard using R Shiny.  
Focuses on tracking billing, collections, forecasting, and impact analysis in healthcare data.

- Visualizations include state, payor, procedure, and time-based revenue insights.

---

### RCM Impact Report (R Shiny + Planning Module)

Designed a scenario modeling tool for forecasting **financial impacts** from expected changes in patient volume or reimbursement.

- Uses historical data (last 12 months) as a baseline.
- Supports custom **payor, procedure, and census-based adjustments**.
- Interactive projection chart with import/export tools and value box summaries.
- Adjustment logic includes compounding growth, share-based impact, and flat patient additions.

> The accompanying notebook outlines the logic and user flow behind this strategic planning tool.

---

### Big Data Transparency Project (PHP / MySQL / Python)

Built a large-scale backend system to manage transparency in coverage data.

- Python pipelines to parse, clean, and structure millions of negotiated insurance rates.
- PHP/MySQL application for real-time querying, visualizations, and report generation across large healthcare datasets.

---

##  Requirements to Run the Notebooks

To run the Transparancy notebook properly, you will need:

- The `exports/` folder included in the repository.

This folder contains the sample datasets used inside the notebooks.

> Please ensure the `exports/` directory is placed at the same level as the notebooks when executing them.

---

- [RCM Dashboard Project](https://github.com/johnmaho1308/Notebooks//RCM_Dashboard_UserGuide.ipynb)
- [Big Data Transparency Project](https://github.com/johnmaho1308/Notebooks//Transparency_Data_Project.ipynb)
- [RCM Impact Report (NEW)](https://github.com/johnmaho1308/Notebooks//RCM_Impact_Report_UserGuide.ipynb)



