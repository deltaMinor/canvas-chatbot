import inspect
from collections.abc import Callable
from functools import wraps
from typing import Any

from shared_libs.exceptions.exceptions import (
    DictionaryKeyError,
    DictionaryValueError,
)

from .helper import (
    validate_key_and_value_not_none,
    validate_no_none_values_in_args_and_kwargs,
)


def verify_data_params(key_list: list[str]) -> Callable:
    """
    Decorator for verifying the presence and non-emptiness of specified keys in the request data.

    This function is a decorator factory. It returns a decorator that can be used to wrap a view function.
    The decorator verifies that all keys in the provided list are present in the request data and that their values are not None.
    If a key is missing or its value is None, an exception is raised.

    Decorators:
        raise_api_exception: Raises a BadRequest exception with a custom message if the decorated function raises an exception.

    Args:
        key_list (List[str]): A list of keys to verify in the request data.

    Returns:
        Callable: The decorator for the view function.
    """
    from rest_framework.views import APIView

    def decorator_function(func: Callable):
        """
        The decorator for the view function.
        """

        @wraps(func)
        def wrapper(view: APIView, *args, **kwargs):
            """
            The wrapper function that performs the verification of keys.

            Args:
                view (APIView): The view instance.
                *args: Variable length argument list.
                **kwargs: Arbitrary keyword arguments.

            Returns:
                Callable: The result of the view function.

            Raises:
                DictionaryKeyError: If a key from the key_list is not found in the request data.
                DictionaryValueError: If the value for a key from the key_list is None in the request data.
            """
            for key in key_list:
                if key not in view.request.data:
                    raise DictionaryKeyError(key)
                if view.request.data.get(key) is None:
                    raise DictionaryValueError(key)
            return func(view, *args, **kwargs)

        return wrapper

    return decorator_function


def verify_files_get_params(key_list: list[str]) -> Callable:
    """
    Decorator for verifying the presence and non-emptiness of specified keys in the request files.

    This function is a decorator factory. It returns a decorator that can be used to wrap a view function.
    The decorator verifies that all keys in the provided list are present in the request files and that their values are not empty.
    If a key is missing or its value is empty, an exception is raised.

    Decorators:
        raise_api_exception: Raises a BadRequest exception with a custom message if the decorated function raises an exception.

    Args:
        key_list (List[str]): A list of keys to verify in the request files.

    Returns:
        Callable: The decorator for the view function.
    """
    from rest_framework.views import APIView

    def decorator_function(func: Callable):
        """
        The decorator for the view function.
        """

        @wraps(func)
        def wrapper(view: APIView, *args, **kwargs):
            """
            The wrapper function that performs the verification of keys.

            Args:
                view (APIView): The view instance.
                *args: Variable length argument list.
                **kwargs: Arbitrary keyword arguments.

            Returns:
                Callable: The result of the view function.

            Raises:
                DictionaryKeyError: If a key from the key_list is not found in the request files.
                DictionaryValueError: If the value for a key from the key_list is undefined or empty in the request files.
            """
            for key in key_list:
                if key not in view.request.FILES:
                    raise DictionaryKeyError(key)
                val = view.request.FILES.get(key)
                if val is None or not len(val):
                    raise DictionaryValueError(key)
            return func(view, *args, **kwargs)

        return wrapper

    return decorator_function


def verify_files_getlist_params(key_list: list[str]) -> Callable:
    """
    Decorator for verifying the presence and non-emptiness of specified keys in the request files.

    This function is a decorator factory. It returns a decorator that can be used to wrap a view function.
    The decorator verifies that all keys in the provided list are present in the request files and that their values are not None.
    If a key is missing or its value is None, an exception is raised.

    Decorators:
        raise_api_exception: Raises a BadRequest exception with a custom message if the decorated function raises an exception.

    Args:
        key_list (List[str]): A list of keys to verify in the request files.

    Returns:
        Callable: The decorator for the view function.
    """
    from rest_framework.views import APIView

    def decorator_function(func: Callable):
        """
        The decorator for the view function.
        """

        @wraps(func)
        def wrapper(view: APIView, *args, **kwargs):
            """
            The wrapper function that performs the verification of keys.

            Args:
                view (APIView): The view instance.
                *args: Variable length argument list.
                **kwargs: Arbitrary keyword arguments.

            Returns:
                Callable: The result of the view function.

            Raises:
                DictionaryKeyError: If a key from the key_list is not found in the request files.
                DictionaryValueError: If the value for a key from the key_list is None in the request files.
            """
            for key in key_list:
                if key not in view.request.FILES:
                    raise DictionaryKeyError(key)
                val = view.request.FILES.getlist(key)
                if val is None or not len(val):
                    raise DictionaryValueError(key)
            return func(view, *args, **kwargs)

        return wrapper

    return decorator_function


def verify_get_params(key_list: list[str]) -> Callable:
    """
    Decorator for verifying the presence and non-emptiness of specified keys in the request GET parameters.

    This function is a decorator factory. It returns a decorator that can be used to wrap a view function.
    The decorator verifies that all keys in the provided list are present in the request GET parameters and that their values are not None.
    If a key is missing or its value is None, an exception is raised.

    Decorators:
        raise_api_exception: Raises a BadRequest exception with a custom message if the decorated function raises an exception.

    Args:
        key_list (List[str]): A list of keys to verify in the request GET parameters.

    Returns:
        Callable: The decorator for the view function.
    """
    from rest_framework.views import APIView

    def decorator_function(func: Callable):
        """
        The decorator for the view function.
        """

        @wraps(func)
        def wrapper(view: APIView, *args, **kwargs):
            """
            The wrapper function that performs the verification of keys.

            Args:
                view (APIView): The view instance.
                *args: Variable length argument list.
                **kwargs: Arbitrary keyword arguments.

            Returns:
                Callable: The result of the view function.

            Raises:
                DictionaryKeyError: If a key from the key_list is not found in the request GET parameters.
                DictionaryValueError: If the value for a key from the key_list is None in the request GET parameters.
            """
            for key in key_list:
                if key not in view.request.GET:
                    raise DictionaryKeyError(key)
                val = view.request.GET.get(key)
                if val is None or not len(val):
                    raise DictionaryValueError(key)
            return func(view, *args, **kwargs)

        return wrapper

    return decorator_function


def verify_params(key_list: list[str] | None = None) -> Callable:
    """
    Decorator for verifying the presence and non-emptiness of specified keys in the function arguments.

    This function is a decorator factory. It returns a decorator that can be used to wrap a function.
    The decorator verifies that all keys in the provided list are present in the function arguments and that their values are not None.
    If a key is missing or its value is None, an exception is raised.

    Decorators:
        raise_api_exception: Raises an InternalServerError exception with a custom message if the decorated function raises an exception.

    Args:
        key_list (List[str] | None): A list of keys to verify in the function arguments. If None, all arguments are verified.

    Returns:
        Callable: The decorator for the function.
    """

    def decorator_function(func: Callable):
        """
        The decorator for the function.
        """

        def raise_if_any_defined_key_undefined(
            args_dict: dict[str, Any],
            kwargs: dict[str, Any],
        ):
            """
            Raises an exception if any of the defined keys is undefined.

            Args:
                args_dict (Dict[str, Any]): A dictionary of argument names and their values.
                kwargs (Dict[str, Any]): A dictionary of keyword argument names and their values.

            Raises:
                DictionaryKeyError: If a key from the key_list is not found in the function arguments.
                DictionaryValueError: If the value for a key from the key_list is None in the function arguments.
            """

            for k in key_list:
                validate_key_and_value_not_none(k, args_dict, kwargs)

        def raise_if_any_key_defined(*args, **kwargs):
            """
            Raises an exception if any of the keys is undefined.

            Args:
                *args: Variable length argument list.
                **kwargs: Arbitrary keyword arguments.

            Raises:
                DictionaryValueError: If any of the argument values is None.
            """

            validate_no_none_values_in_args_and_kwargs(args, kwargs)

        @wraps(func)
        def wrapper(*args, **kwargs):
            """
            The wrapper function that performs the verification of keys.

            Args:
                *args: Variable length argument list.
                **kwargs: Arbitrary keyword arguments.

            Returns:
                Callable: The result of the function.
            """
            if key_list is None:
                raise_if_any_key_defined(*args, **kwargs)
                return func(*args, **kwargs)

            args_name = inspect.getfullargspec(func)[0]
            args_dict = {args_name[index]: v for index, v in enumerate(args)}
            raise_if_any_defined_key_undefined(args_dict, kwargs)
            return func(*args, **kwargs)

        return wrapper

    return decorator_function


__all__ = [
    "verify_data_params",
    "verify_files_get_params",
    "verify_files_getlist_params",
    "verify_get_params",
    "verify_params",
]
