import { readFileSync } from "node:fs";
import Ajv2020, { type ErrorObject, type ValidateFunction } from "ajv/dist/2020.js";
import { SCHEMA_PATH } from "./paths";

/**
 * Validação estrutural contra `spec/sprint.schema.json`.
 *
 * O schema é carregado do arquivo, nunca reescrito em código: o contrato tem um
 * só lugar. Editar o JSON muda a validação sem tocar aqui.
 */

let validator: ValidateFunction | undefined;

function getValidator(): ValidateFunction {
  if (!validator) {
    const schema = JSON.parse(readFileSync(SCHEMA_PATH, "utf8"));
    const ajv = new Ajv2020({ allErrors: true, strict: false });
    validator = ajv.compile(schema);
  }
  return validator;
}

function formatError(error: ErrorObject): string {
  const where = error.instancePath || "(raiz)";
  return `${where} ${error.message ?? "inválido"}`;
}

export interface SchemaResult {
  valid: boolean;
  errors: string[];
}

/** Valida um documento contra o JSON Schema, devolvendo todos os erros. */
export function validateSchema(document: unknown): SchemaResult {
  const validate = getValidator();
  const valid = validate(document) as boolean;
  const errors = (validate.errors ?? []).map(formatError);
  return { valid, errors };
}
