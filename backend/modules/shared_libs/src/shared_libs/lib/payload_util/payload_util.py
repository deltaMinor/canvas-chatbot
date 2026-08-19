from copy import deepcopy


class PayloadUtil:
    def __init__(self):
        pass

    def merge_payloads(self, original: dict, updates: dict) -> dict:
        """ "
        Payload may contain partial updates to nested objects.
        Perform a deep merge with the existing payload so that only the
        intended fields are updated and unrelated nested data is preserved.
        """
        result = deepcopy(original)

        for key, value in updates.items():
            if (
                key in result
                and isinstance(result[key], dict)
                and isinstance(value, dict)
            ):
                result[key] = self.merge_payloads(result[key], value)
            else:
                result[key] = value

        return result
