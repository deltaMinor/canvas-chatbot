class LLMPromptUtil:
    @staticmethod
    def add_word_and_to_sentence(sentence: str) -> str:
        if ", " in sentence:
            last_comma = sentence.rfind(",")
            sentence = sentence[:last_comma] + ", and" + sentence[last_comma + 1 :]
        return sentence
