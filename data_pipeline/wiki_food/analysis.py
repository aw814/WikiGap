import os
import pickle
import matplotlib.pyplot as plt

# List of topics to include in the analysis
TOPICS = [
    "Injera",         # East Africa, unique cultural significance
    "Oolong",         # Chinese, globally loved
    "Paella",         # Spanish, seafood/meat mixed rice
    "Peking Duck",
"Philippine adobo",
"Pelmeni",
"Wiener schnitzel",
"Surströmming",
"Hummus"]

def topic_to_filename(topic):
    return topic + "_en.pkl"

def extract_text_from_article(article_data):
    text = ""
    for item in article_data:
        for key in item:
            if key.startswith("paragraph") or key.startswith("header"):
                text += " " + item[key]
    return text

def count_words(text):
    return len(text.split())

def main():
    word_counts = {}

    for topic in TOPICS:
        filename = topic_to_filename(topic)
        if os.path.exists(filename):
            with open(filename, "rb") as f:
                data = pickle.load(f)
                if isinstance(data, list):
                    full_text = extract_text_from_article(data)
                    word_counts[topic] = count_words(full_text)
                else:
                    print(f"Warning: {filename} doesn't contain a list.")
        else:
            print(f"File not found: {filename}")

    # Plotting
    topics = list(word_counts.keys())
    counts = [word_counts[topic] for topic in topics]

    plt.figure(figsize=(12, 6))
    bars = plt.bar(topics, counts)
    plt.xlabel("Wikipedia Topics")
    plt.ylabel("Word Count")
    plt.title("Word Count of Selected English Wikipedia Articles")
    plt.xticks(rotation=45, ha="right")
    # Add word count labels above each bar
    for bar, count in zip(bars, counts):
        plt.text(bar.get_x() + bar.get_width() / 2, bar.get_height(),
                 str(count), ha='center', va='bottom')
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    main()