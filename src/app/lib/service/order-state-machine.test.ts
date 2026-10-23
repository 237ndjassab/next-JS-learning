// src/lib/order-state-machine.test.ts
import { describe, it, expect } from "vitest";
import { OrderStatus } from "../../../../generated/prisma/enums";
import { assertTransition, canTransition } from "../order-state-machine";

// Liste écrite À LA MAIN, indépendante de l'implémentation.
const VALID = new Set([
  "PENDING->CONFIRMED",
  "CONFIRMED->PREPARING",
  "PREPARING->READY",
  "READY->ASSIGNED",
  "ASSIGNED->PICKED_UP",
  "PICKED_UP->IN_DELIVERY",
  "IN_DELIVERY->DELIVERED",
  "PENDING->CANCELLED",
  "CONFIRMED->CANCELLED",
  "PREPARING->CANCELLED",
  "READY->CANCELLED",
  "ASSIGNED->CANCELLED",
  "PICKED_UP->CANCELLED",
]);

const ALL = Object.values(OrderStatus);

describe("canTransition : toutes les paires", () => {
  const pairs = ALL.flatMap((from) => ALL.map((to) => [from, to] as const));

  it.each(pairs)("%s -> %s", (from, to) => {
    expect(canTransition(from, to)).toBe(VALID.has(`${from}->${to}`));
  });
});

describe("états terminaux", () => {
  it.each(["DELIVERED", "CANCELLED"] as const)("%s n'a aucune sortie", (s) => {
    expect(ALL.some((to) => canTransition(s, to))).toBe(false);
  });
});

describe("assertTransition : transition interdite", () => {
  it("lance une ServiceError pour PENDING->DELIVERED", () => {
    expect(() => assertTransition("PENDING", "DELIVERED")).toThrow();
  });
});
