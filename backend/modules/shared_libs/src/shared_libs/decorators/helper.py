from shared_libs.exceptions.exceptions import DictionaryKeyError, DictionaryValueError


def validate_key_and_value_not_none(k, args_dict, kwargs):
    """
    Validates that a key exists and its value is not None in either a dictionary of arguments or keyword arguments.

    Args:
        k (str): The key to validate.
        args_dict (dict): The dictionary of arguments to validate.
        kwargs (dict): The dictionary of keyword arguments to validate.

    Raises:
        DictionaryValueError: If the key exists but its value is None.
        DictionaryKeyError: If the key does not exist in either dictionary.
    """
    if (k in args_dict and args_dict[k] is None) or (k in kwargs and kwargs[k] is None):
        raise DictionaryValueError(k)
    if k not in args_dict and k not in kwargs:
        raise DictionaryKeyError(k)


def validate_no_none_values_in_args_and_kwargs(args, kwargs):
    """
    Validates that there are no None values in a list of arguments and a dictionary of keyword arguments.

    Args:
        args (list): The list of arguments to validate.
        kwargs (dict): The dictionary of keyword arguments to validate.

    Raises:
        DictionaryValueError: If any value is None.
    """
    if any(arg is None for arg in args):
        raise DictionaryValueError()
    if any(v is None for k, v in kwargs.items()):
        raise DictionaryValueError()


__all__ = [
    "validate_key_and_value_not_none",
    "validate_no_none_values_in_args_and_kwargs",
]
