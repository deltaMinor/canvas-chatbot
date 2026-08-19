import { describe, expect, it, vi } from "vitest";

// --- Mocks ------------------------------------------------------------------
// Keep keys consistent between the mapping and NodeIconKey so reverse lookup works.
vi.mock("#root/constants/terraformMapping", () => ({
    terraform_mapping: {
        aws_s3_bucket: "s3",
        aws_ec2_instance: "ec2",
        kubernetes_deployment: "k8s_deploy",
    } as Record<string, string>,
}));

vi.mock("#root/interfaces/svg", () => ({
    NodeIconKey: {
        aws_s3_bucket: "aws_s3_bucket",
        aws_ec2_instance: "aws_ec2_instance",
        kubernetes_deployment: "kubernetes_deployment",
        genericServer: "genericServer",
    },
}));

// Import the SUT *after* mocks
const { getTerraformType, getIconType } = await import("./diagramTerraform");

describe("terraform utils", () => {
    // ---------------- getTerraformType ----------------
    describe("getTerraformType", () => {
        it("returns the mapped terraform type for a known label", () => {
            expect(getTerraformType("aws_s3_bucket")).toBe("s3");
            expect(getTerraformType("aws_ec2_instance")).toBe("ec2");
            expect(getTerraformType("kubernetes_deployment")).toBe("k8s_deploy");
        });

        it("returns empty string for an unknown label", () => {
            expect(getTerraformType("unknown_resource")).toBe("");
            // also check edge-ish inputs
            expect(getTerraformType("" as unknown as string)).toBe("");
        });
    });

    // ---------------- getIconType ----------------
    describe("getIconType", () => {
        it("performs reverse lookup: returns the icon key for a known terraform type", () => {
            // Expect to get back the *key* from the mapping (which matches NodeIconKey values in our mock)
            expect(getIconType("s3")).toBe("aws_s3_bucket");
            expect(getIconType("ec2")).toBe("aws_ec2_instance");
            expect(getIconType("k8s_deploy")).toBe("kubernetes_deployment");
        });

        it("returns NodeIconKey.genericServer when terraform type is not mapped", async () => {
            // Pull the mocked NodeIconKey to assert against the constant value
            const { NodeIconKey } = await import("#root/interfaces/svg");
            expect(getIconType("not_a_real_type")).toBe(NodeIconKey.genericServer);
            expect(getIconType("" as unknown as string)).toBe(NodeIconKey.genericServer);
        });

        it("does not throw when mapping is empty and falls back to generic", async () => {
            // Temporarily replace the mapping for this check
            const mod = await import("#root/constants/terraformMapping");
            const original = { ...mod.terraform_mapping };
            try {
                // @ts-expect-error: test mutation
                mod.terraform_mapping = {};
                const { NodeIconKey } = await import("#root/interfaces/svg");
                expect(getIconType("ec2")).toBe(NodeIconKey.genericServer);
            } finally {
                // restore
                // @ts-expect-error: test mutation
                mod.terraform_mapping = original;
            }
        });
    });
});
