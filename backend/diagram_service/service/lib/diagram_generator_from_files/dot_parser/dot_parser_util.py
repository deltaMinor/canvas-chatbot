import json
import logging

logger = logging.getLogger(__name__)


class DotParserUtil:
    @staticmethod
    def is_prefix_match(prefix_list, label):
        if not bool(label):
            return False
        for prefix in prefix_list:
            if label.startswith(prefix):
                return True
        return False

    @staticmethod
    def is_exact_match(ref_labels, label):
        if not bool(label):
            return False
        for ref_label in ref_labels:
            if label == ref_label:
                return True
        return False

    @staticmethod
    def write_file(asset_directory, filename, data):
        logger.info(f"[ ARCH-DIAGRAM ] Writing data to {filename} ...")
        if ".json" in filename:
            with open(f"{asset_directory}/{filename}", "w+") as outfile:
                json.dump(data, outfile)
            return
        with open(f"{asset_directory}/{filename}", "w+") as outfile:
            for line in data:
                outfile.write(f"{line}\n")
