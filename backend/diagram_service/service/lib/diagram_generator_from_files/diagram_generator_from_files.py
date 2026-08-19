import base64
import logging
import os
import shutil
import subprocess

from shared_libs.decorators import raise_exception

from .dot_parser.dot_parser import DotParser

logger = logging.getLogger(__name__)


class DiagramGeneratorFromFiles:
    def __init__(self):
        pass

    @raise_exception(
        "Failed to run terraform init.",
        exception_logger=logger,
    )
    def run_terraform_init(self, TERRAFORM_FILES_DIR):
        logger.info("[ ARCH-DIAGRAM ] Running terraform init ...")
        subprocess.run(
            "terraform init",
            shell=True,
            cwd=TERRAFORM_FILES_DIR,
        )

    @raise_exception(
        "Failed to run terraform graph.",
        exception_logger=logger,
    )
    def run_terraform_graph(self, in_filename, TERRAFORM_FILES_DIR, GRAPH_FILES_DIR):
        file_in = f"{GRAPH_FILES_DIR}/{in_filename}"
        logger.info("[ ARCH-DIAGRAM ] Running terraform graph ...")
        with open(file_in, "w+", encoding="utf-8") as file:
            subprocess.run(
                "terraform graph",
                shell=True,
                cwd=TERRAFORM_FILES_DIR,
                stdout=file,
            )

    @raise_exception(
        "Failed to save database files in local directory.",
        exception_logger=logger,
    )
    def save_database_files_in_local_directory(self, files, FILES_DIR):
        os.makedirs(FILES_DIR, exist_ok=True)

        for file in files.copy():
            if isinstance(file, dict):
                target = os.path.join(FILES_DIR, file["filename"])
                with open(target, "wb+") as file_object:
                    file_object.write(base64.b64decode(file["data"]))
                continue

            target = os.path.join(FILES_DIR, file.name)
            with open(target, "wb+") as file_object:
                shutil.copyfileobj(file, file_object)

    @raise_exception(
        "Failed to generate diagram from file.",
        exception_logger=logger,
    )
    def get_generated_diagram(self, db_files, terraform_dir, graph_dir):
        try:
            self.save_database_files_in_local_directory(db_files, terraform_dir)

            self.run_terraform_init(
                TERRAFORM_FILES_DIR=terraform_dir,
            )

            self.run_terraform_graph(
                "graph_in.dot",
                TERRAFORM_FILES_DIR=terraform_dir,
                GRAPH_FILES_DIR=graph_dir,
            )

            dot_parser = DotParser()
            diagram, provider = dot_parser.parseDot(
                in_filename="graph_in.dot",
                out_filename="graph_out.json",
                tf_filename="tfStorage.json",
                TERRAFORM_FILES_DIR=terraform_dir,
                WORKING_DIR=graph_dir,
            )
            return diagram, provider
        except Exception as e:
            logger.error(f"Failed to generate diagram: {e}")
            return None, None
        finally:
            shutil.rmtree(terraform_dir)
            shutil.rmtree(graph_dir)
