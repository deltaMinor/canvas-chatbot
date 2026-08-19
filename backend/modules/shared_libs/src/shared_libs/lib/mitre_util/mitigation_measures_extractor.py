import os

import shortuuid

from shared_libs.lib.global_shared_util import GlobalSharedUtil


class MitigationMeasuresExtractor:
    def __init__(self, rr_data_dir: str) -> None:
        self.rr_data_dir = rr_data_dir

    def extract_mitigation_measures(self) -> dict:
        master_register_file_path = os.path.join(
            self.rr_data_dir, "master_register.json"
        )
        master_register_json_data = GlobalSharedUtil.load_json(
            master_register_file_path
        )

        mitigation_measures_list = []
        measure_to_id_map: dict[str, str] = {}
        mitigation_id_mapping: dict[str, str] = {}

        for risk_scenario in master_register_json_data.get("risk_scenarios", []):
            new_mitigation_measure_list: list[str] = []

            for mitigation_measure in risk_scenario.get(
                "recommendedMitigationMeasures", []
            ):
                mitigation_measure.pop("header", None)
                mitigation_measure["category"] = []

                measure = mitigation_measure.get("measure", "")
                if measure not in measure_to_id_map:
                    mitigation_id = f"m_{shortuuid.ShortUUID().random(length=16)}"
                    measure_to_id_map[measure] = mitigation_id

                    mitigation_measure["source"] = "master_register"
                    mitigation_measure["ref"] = {}
                    mitigation_measures_list.append(mitigation_measure)

                    old_id = mitigation_measure.get("id", "")
                    if old_id:
                        mitigation_id_mapping[old_id] = mitigation_id
                else:
                    mitigation_id = measure_to_id_map.get(measure, "")

                mitigation_measure["id"] = mitigation_id
                new_mitigation_measure_list.append(mitigation_id)

            risk_scenario["recommendedMitigationMeasures"] = new_mitigation_measure_list

        return {
            "master_register_json_data": master_register_json_data,
            "mitigation_measures_list": mitigation_measures_list,
            "mitigation_id_mapping": mitigation_id_mapping,
        }
