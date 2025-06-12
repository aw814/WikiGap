import json
import glob
import os
import openai
 
URL_ENDPOINT = ""

client = ""
def extract_facts(filename, topic):
    with open(filename, 'r', encoding='utf-8') as file:
        data = json.load(file)

    results = {}
    languages = data[topic]["languages"]

    for lang, lang_content in languages.items():
        entries = []
        headers = lang_content["headers"]

        for header_info in headers.values():
            for entry in header_info["entries"]:
                fact = entry["fact"]
                entries.append({
                    "original": fact.get("original", ""),
                    "translated": fact.get("translated", ""),
                    "fact_aligned_sentence": fact.get("fact_aligned_sentence", ""),
                    "src_context": entry.get("src_context", [])
                })

        results[lang] = entries

    return results

def generate_quiz_questions(topic, facts_by_language):
    prompt = f"Given the provided facts about {topic} sourced from Russian (ru), French (fr), and Chinese (zh) Wikipedia articles, perform the following tasks:\n\n1. Select 13 facts that highlight significant, interesting, and culturally relevant aspects of {topic}. Each language (ru, fr, zh) should contribute at least one selected fact.\n\n2. Create 10 multiple-choice quiz questions based on these selected facts. Questions should test readers' knowledge acquisition and deepen their cultural understanding, emphasizing meaningful and culturally insightful aspects rather than trivial or overly technical details (e.g., pronunciation guides in IPA should be avoided).\n\n- Questions must be written clearly and concisely in English.\n- Provide exactly four answer options (A, B, C, D) for each question.\n- Ensure the correct answer is explicitly inferable from the provided translated facts.\n\nFormat your output exactly as shown in the example below:\n\n**Question:** Which type of oolong tea is known for having the weakest degree of fermentation?\nOptions:\nA. Da Hong Pao\nB. Wen Shan Bao Zhong\nC. Tie Guan Yin\nD. Dong Ding Oolong\n\nAnswer: B. Wen Shan Bao Zhong"

    for lang in ['ru', 'fr', 'zh']:
        facts = facts_by_language.get(lang, [])
        prompt += f"\n{lang} Facts:\n"
        for idx, fact in enumerate(facts, 1):
            prompt += f"{idx}. Translated Fact: {fact['translated']}\n"
            # prompt += f"Source Context: {fact['src_context']}\n"

    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are an assistant generating quiz questions from provided facts."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.7,
        max_tokens=1000
    )
    print(prompt)
    print("\n\n")
    print(response.choices[0].message.content.strip())
    return response.choices[0].message.content.strip()

def main():
    folder_path = 'data_pipeline/wikigap_data/json/'
    json_files = glob.glob(os.path.join(folder_path, 'Paella.json'))

    all_topics_facts = {}

    with open('extracted_facts.txt', 'w', encoding='utf-8') as out_file:
        for file_path in json_files:
            topic = os.path.splitext(os.path.basename(file_path))[0]
            out_file.write(f"\n=== Topic: {topic} ===\n")
            print(f"\nProcessing topic: {topic}")
            facts_by_language = extract_facts(file_path, topic)
            all_topics_facts[topic] = facts_by_language

            # GPT call for generating quiz questions
            print(f"Generating quiz questions for topic: {topic}")
            quiz_questions = generate_quiz_questions(topic, facts_by_language)

            # Saving generated quiz questions to a file
            with open(f'./quiz_questions/quiz_{topic}.txt', 'w', encoding='utf-8') as quiz_file:
                quiz_file.write(quiz_questions)
            print(f"Quiz questions for {topic} saved successfully.")

            for lang, facts in facts_by_language.items():
                out_file.write(f"\n-- Language: {lang} --\n")
                for idx, fact in enumerate(facts, start=1):
                    out_file.write(f"\nFact #{idx}:\n")
                    out_file.write(f"  Original: {fact['original']}\n")
                    out_file.write(f"  Translated: {fact['translated']}\n")
                    out_file.write(f"  Aligned Sentence: {fact['fact_aligned_sentence']}\n")
                    out_file.write(f"  Source Context: {fact['src_context']}\n")

    print("\nFacts have been successfully saved to 'extracted_facts.txt'.")

if __name__ == "__main__":
    main()
