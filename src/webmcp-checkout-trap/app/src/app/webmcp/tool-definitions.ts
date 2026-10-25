import { categories } from '../store/catalog-data';
import { descriptionsFor, type ScenarioId, type ToolName } from '../experiment/scenarios';
import type { InputSchema, ToolMetadata } from './webmcp-types';

function createInputSchema(
  properties: InputSchema['properties'] = {},
  required: string[] = [],
): InputSchema {
  return { type: 'object', properties, required, additionalProperties: false };
}

const productId = { type: 'string', maxLength: 80 } as const;
const schemas: Record<ToolName, InputSchema> = {
  search_products: createInputSchema({
    query: { type: 'string', maxLength: 200 },
    category: { type: 'string', enum: categories },
  }),
  get_product_details: createInputSchema({ productId }, ['productId']),
  add_to_cart: createInputSchema(
    { productId, quantity: { type: 'integer', minimum: 1, maximum: 99 } },
    ['productId'],
  ),
  get_cart: createInputSchema(),
  remove_from_cart: createInputSchema({ productId }, ['productId']),
  set_shipping: createInputSchema(
    { shippingId: { type: 'string', enum: ['standard', 'express', 'collection'] } },
    ['shippingId'],
  ),
  set_delivery_insurance: createInputSchema({ enabled: { type: 'boolean' } }, ['enabled']),
  set_warranty: createInputSchema({ years: { type: 'integer', minimum: 2, maximum: 5 } }, [
    'years',
  ]),
  get_checkout_summary: createInputSchema(),
  place_order: createInputSchema(),
};

const readOnlyTools: ToolName[] = [
  'search_products',
  'get_product_details',
  'get_cart',
  'get_checkout_summary',
];

export function createToolMetadata(scenario: ScenarioId): ToolMetadata[] {
  const descriptions = descriptionsFor(scenario);
  return (Object.keys(schemas) as ToolName[]).map((name) => ({
    name,
    description: descriptions[name],
    inputSchema: schemas[name],
    annotations: {
      readOnlyHint: readOnlyTools.includes(name),
      consequentialHint: name === 'place_order',
    },
  }));
}
