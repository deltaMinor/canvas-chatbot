class PromptConstruction:
    def __init__(self, base_prompt_template):
        self.save_base = base_prompt_template.copy()
        self.base_prompt = base_prompt_template

    def customize(self, list_addition, list_indices_addition):
        for i in range(0, len(list_addition)):
            added_template = list_addition[i]
            idx_add = list_indices_addition[i]

            self.base_prompt.insert(idx_add, added_template)

    def get_prompt_template(self):
        return " ".join(self.base_prompt)

    def reset_prompt(self):
        self.base_prompt = self.save_base.copy()
