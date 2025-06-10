# WikiGap: Promoting Epistemic Equity by Surfacing Knowledge Gaps Between English Wikipedia and Other Language Editions

This repository contains the source code and resources for the system described in our paper:

> **WikiGap: Promoting Epistemic Equity by Surfacing Knowledge Gaps Between English Wikipedia and Other Language Editions**  

## 🔍 Overview

WikiGap is a browser extension and backend pipeline that identifies and surfaces factual asymmetries between English Wikipedia and other language editions (e.g., French, Chinese, Russian). It aims to:

- Challenge the "English-as-superset" assumption
- Enhance cross-lingual awareness and access
- Support multilingual knowledge equity

The system integrates:
- A multilingual fact comparison pipeline (adapted from InfoGap [https://github.com/smfsamir/infogap](https://github.com/smfsamir/infogap))
- A Chrome extension interface for surfacing significant knowledge gaps
- Support for English-Chinese, English-French, and English-Russian comparisons

## 🛠️ Components

- `data_pipeline/`: Scripts for detecting significant cross-lingual fact mismatches
- `content.js`: code for the Chrome extension
- `quiz_questions/`: Example quiz quesitons used in the user study.
- `studyeval/`: Scripts and notebooks for user study data and analysis (git ignored when upload)

## 🚀 Getting Started

### 🔍 How to Test the WikiGap Extension

To test the extension, as our user study participants did:

1. git clone https://github.com/aw814/WikiGap.git
2. Zip the contents of the cloned directory (zip the files inside, not the folder itself).
3. Load the extension in Chrome
    - Open chrome://extensions/
    - Toggle Developer mode (top-right corner)
	- Click Load unpacked and select the unzipped directory
	- Visit any of these English Wikipedia articles to see WikiGap in action: Peking Duck, Philippine Adobo, Paell, Injera, Wiener Schnitzel
(These pages are backed by the sample dataset included with the repo.)

Certainly! Here’s the continuation in Markdown format, directly following the previous section, and answering the second question in a clear and structured way:

### How to Apply WikiGap to More Articles

If you want to apply the extension to additional Wikipedia articles beyond the five provided, follow these steps:

1. **Run the InfoGap pipeline**  
   Use the [InfoGap pipeline](https://github.com/smfsamir/infogap) to extract factual differences between English and non-English versions of a target article. The pipeline generates outputs that identify asymmetric or missing information across language editions.

2. **Generate comparison files**  
   After running the InfoGap pipeline on your article of interest, you will get three output files per language. These files are automatically named using the format: <generation_date>_<article_topic>_<targeted_lang>.json
   For example:annotation_2024-03-24_Peking_Duck_fr.json

3. **Place files in the correct directory**  
Save all generated files under the `wikigap/data/` directory in this repository.

4. **Run the annotation preprocessor**  
Execute the following script to process the raw InfoGap output into a format the extension can use:
```bash
python wikigap/process_annotations.py
```

This script will produce .json files that the Chrome extension reads when visiting matching articles.

Once these steps are complete, refresh your extension in Google manage extension, and visit the corresponding English Wikipedia article in Chrome with the extension enabled will surface the new cross-lingual facts.


## 📄 Paper

> A preprint:[Link](https://arxiv.org/abs/2505.24195)

## 🤝 Citation

If you use this codebase or data, please cite our paper: