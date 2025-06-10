# WikiGap: Promoting Epistemic Equity by Surfacing Knowledge Gaps Between English Wikipedia and Other Language Editions

This repository contains the source code and resources for the system described in our paper:

> **WikiGap: Promoting Epistemic Equity by Surfacing Knowledge Gaps Between English Wikipedia and Other Language Editions**  
> *Submitted to CSCW 2026*

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
- `extension/`: Source code for the Chrome extension
- `quiz_questions/`: Example input/output files (facts, gaps, context)
- `evaluation/`: Scripts and notebooks for user study data and analysis

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


## 📄 Paper

> A preprint will be posted soon.  
> [Link to paper (TBA)]()

## 🧪 User Study

Details of the user study design, quiz materials, and statistical evaluation are available in the `evaluation/` folder. The repository includes:

- Survey instruments
- Quiz questions (multilingual facts)
- Analysis scripts (e.g., for accuracy, completion time)

## 📦 Dependencies

- Python 3.8+
- Node.js (for the extension build)
- Chrome browser (for testing the extension)
- See `requirements.txt` and `package.json` for full dependencies

## 📜 License

MIT License. See `LICENSE` for details.

## 🤝 Citation

If you use this codebase or data, please cite our paper: