import { describe, expect, it } from "vitest";
import { Role } from "../../../../../generated/prisma/enums";
import { can, PERMISSIONS, type Permission } from "../permissions";

// Typé explicitement : plus besoin de `as Permission`, et une faute de frappe
// dans "permission" fait échouer la compilation.
const VALID_RBAC: { permission: Permission; roles: readonly Role[] }[] = [
  { permission: "order:create", roles: ["CUSTOMER"] },
  { permission: "order:read:own", roles: ["CUSTOMER", "MERCHANT", "DRIVER"] },
  { permission: "order:read:any", roles: ["ADMIN"] },
  { permission: "order:manage", roles: ["MERCHANT", "ADMIN"] },
  { permission: "order:transition", roles: ["MERCHANT", "DRIVER", "ADMIN"] },
  { permission: "order:edit", roles: ["CUSTOMER", "ADMIN"] },
  { permission: "order:cancel", roles: ["CUSTOMER", "MERCHANT", "ADMIN"] },
  { permission: "product:manage", roles: ["MERCHANT", "ADMIN"] },
  { permission: "product:read:any", roles: ["CUSTOMER", "MERCHANT", "DRIVER", "ADMIN"] },
  { permission: "user:manage", roles: ["ADMIN"] },
  { permission: "delivery:manage", roles: ["ADMIN"] },
  { permission: "delivery:read:own", roles: ["DRIVER"] },
];

const ALL_ROLES = Object.values(Role);

describe("Matrice RBAC", () => {
  const pairs = ALL_ROLES.flatMap((role) =>
    VALID_RBAC.map(({ permission, roles }) => ({
      role,
      permission,
      expected: roles.includes(role), // true OU false selon la politique voulue
    })),
  );

  it.each(pairs)(
    "[$role] sur [$permission] → accès attendu : $expected",
    ({ role, permission, expected }) => {
      expect(can(role, permission)).toBe(expected); // ✅ on compare à l'attendu
    },
  );

  // Garde-fou : une nouvelle permission ajoutée au code sans test fait échouer ici.
  it("couvre toutes les permissions déclarées", () => {
    expect(VALID_RBAC.map((p) => p.permission).sort()).toEqual(
      Object.keys(PERMISSIONS).sort(),
    );
  });
});