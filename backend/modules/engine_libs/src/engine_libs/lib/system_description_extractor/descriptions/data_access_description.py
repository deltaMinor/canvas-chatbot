import logging

import pandas as pd

logger = logging.getLogger(__name__)


class DataAccessDescription:
    def __init__(self):
        pass

    @staticmethod
    def location_data_permissions(access_control):
        """
        Generates descriptive sentences about data permissions for each location based on access control information.

        Args:
            access_control (list[dict] or pandas.DataFrame):
                A list of dictionaries or a DataFrame containing access control information.
                Each record should have at least the following keys/columns: 'location', 'data', 'user', and 'permissions'.

        Returns:
            str: A concatenated string of sentences describing the data permissions for each location.

        Raises:
            Exception: If there is an error during the processing of access control data.
        """
        df_access = pd.DataFrame(access_control)
        from engine_libs.lib.system_description_extractor import (
            SystemDescriptionExtractor,
        )

        loc_sentences = []
        for loc, group in df_access.groupby("location"):
            if loc != "":
                data_list = ", ".join(list(set(group["data"])))
                data_list = SystemDescriptionExtractor.add_word_and_to_sentence(
                    data_list
                )
                sentence = f"On the {loc} component, there are {data_list}."
                perm_sentences = []
                for data_name, data_group in group.groupby("data"):
                    permissions = ", ".join(
                        [
                            f"{row['user']} can {row['permissions']}"
                            for _, row in data_group.iterrows()
                        ]
                    )
                    # Add "and" before the last permission if there are multiple
                    permissions = SystemDescriptionExtractor.add_word_and_to_sentence(
                        permissions
                    )
                    perm_sentences.append(
                        f"The permissions for {data_name} is as follows: {permissions}."
                    )
                loc_sentences.append(sentence + " ".join(perm_sentences))
        return " ".join(loc_sentences)

    @staticmethod
    def data_location_permissions(access_control):
        """
        Generates descriptive sentences about where each data item is stored and the permissions associated with it.

        Args:
            access_control (list[dict] or pandas.DataFrame):
                A list of dictionaries or a DataFrame containing access control information.
                Each record should have at least the following keys/columns: 'location', 'data', 'user', and 'permissions'.

        Returns:
            str: A concatenated string of sentences describing the storage locations and permissions for each data item.

        Raises:
            Exception: If there is an error during the processing of access control data.
        """
        data_sentences = []
        from engine_libs.lib.system_description_extractor import (
            SystemDescriptionExtractor,
        )

        if len(access_control) > 0:
            df_access = pd.DataFrame(access_control)
            for data, group in df_access.groupby("data"):
                loc_list = ", ".join(list(set(group["location"])))
                loc_list = SystemDescriptionExtractor.add_word_and_to_sentence(loc_list)
                sentence = f"{data} is stored on {loc_list}." + " "
                perm_sentences = []
                permissions = ", ".join(
                    [
                        f"{row['permissions']} by {row['user']}"
                        for _, row in group.iterrows()
                    ]
                )
                permissions = SystemDescriptionExtractor.add_word_and_to_sentence(
                    permissions
                )
                perm_sentences.append(f"The data can be {permissions}.")
                data_sentences.append(sentence + " ".join(perm_sentences))
        return " ".join(data_sentences)
