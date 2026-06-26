import { Hono } from 'hono';

const nl = new Hono();

// ─── In-memory test contracts ───────────────────────────────────────────────

interface Contract {
  contract_number: string;
  license_plate: string;
  phone: string;
  postal_code: string;
  house_number: string;
  date_of_birth: string | null;
  customer: { first_name: string; last_name: string; email: string; phone: string };
  vehicle: { make: string; model: string; year: number; license_plate: string };
  product: string;
  offerte_template: string;
  contract_details: {
    start_date: string;
    end_date: string;
    monthly_cost: number;
    current_mileage: number;
    max_mileage: number;
  };
}

const contracts: Contract[] = [
  {
    contract_number: 'NL-2024-001',
    license_plate: 'AB-123-CD',
    phone: '+31612345678',
    postal_code: '3011AA',
    house_number: '10',
    date_of_birth: '1988-05-14',
    customer: { first_name: 'Jan', last_name: 'de Vries', email: 'jan@example.nl', phone: '+31612345678' },
    vehicle: { make: 'BMW', model: '320i', year: 2022, license_plate: 'AB-123-CD' },
    product: 'financial_lease',
    offerte_template: 'FL_EARLY_TERM_V2',
    contract_details: { start_date: '2022-01-15', end_date: '2026-01-15', monthly_cost: 589.0, current_mileage: 45000, max_mileage: 80000 },
  },
  {
    contract_number: '147258369',
    license_plate: 'GZ618Z',
    phone: '+31641066803',
    postal_code: '1077ZX',
    house_number: '128',
    date_of_birth: '1979-11-03',
    customer: { first_name: 'Abdel', last_name: 'Aissati', email: 'abdel.aissati@example.nl', phone: '+31698765432' },
    vehicle: { make: 'BMW', model: 'X3 xDrive30e', year: 2023, license_plate: 'GZ618Z' },
    product: 'operational_lease',
    offerte_template: 'BMW operational_lease ',
    contract_details: { start_date: '2023-03-01', end_date: '2027-03-01', monthly_cost: 845.0, current_mileage: 22000, max_mileage: 100000 },
  },
  {
    contract_number: 'NL-2024-003',
    license_plate: 'IJ-789-KL',
    phone: '+31655512345',
    postal_code: '3512BN',
    house_number: '24A',
    date_of_birth: null,
    customer: { first_name: 'Pieter', last_name: 'Jansen', email: 'p.jansen@example.nl', phone: '+31655512345' },
    vehicle: { make: 'BMW', model: 'iX1', year: 2024, license_plate: 'IJ-789-KL' },
    product: 'private_lease',
    offerte_template: 'PL_EARLY_TERM_V1',
    contract_details: { start_date: '2024-06-01', end_date: '2028-06-01', monthly_cost: 699.0, current_mileage: 5000, max_mileage: 60000 },
  },
  {
    contract_number: 'NL-2024-004',
    license_plate: 'MN-012-OP',
    phone: '+31622233344',
    postal_code: '5611AK',
    house_number: '52',
    date_of_birth: '1990-09-21',
    customer: { first_name: 'Lisa', last_name: 'van den Berg', email: 'lisa.vdberg@example.nl', phone: '+31622233344' },
    vehicle: { make: 'BMW', model: '530e', year: 2021, license_plate: 'MN-012-OP' },
    product: 'financial_lease',
    offerte_template: 'FL_EARLY_TERM_V2',
    contract_details: { start_date: '2021-09-01', end_date: '2025-09-01', monthly_cost: 729.0, current_mileage: 78000, max_mileage: 120000 },
  },
  {
    contract_number: 'NL-2024-005',
    license_plate: 'QR-345-ST',
    phone: '+31677788899',
    postal_code: '2511BT',
    house_number: '7',
    date_of_birth: '1985-12-05',
    customer: { first_name: 'Thomas', last_name: 'Smit', email: 'thomas.smit@example.nl', phone: '+31677788899' },
    vehicle: { make: 'BMW', model: 'M340i', year: 2023, license_plate: 'QR-345-ST' },
    product: 'operational_lease',
    offerte_template: 'OL_EARLY_TERM_V3',
    contract_details: { start_date: '2023-11-15', end_date: '2026-11-15', monthly_cost: 1120.0, current_mileage: 18000, max_mileage: 90000 },
  },
  {
    contract_number: 'NL-2024-006',
    license_plate: 'UV-678-WX',
    phone: '+31644455566',
    postal_code: '9711NB',
    house_number: '33',
    date_of_birth: '1996-04-18',
    customer: { first_name: 'Emma', last_name: 'Mulder', email: 'emma.mulder@example.nl', phone: '+31644455566' },
    vehicle: { make: 'BMW', model: 'i4 eDrive40', year: 2024, license_plate: 'UV-678-WX' },
    product: 'private_lease',
    offerte_template: 'PL_EARLY_TERM_V1',
    contract_details: { start_date: '2024-02-01', end_date: '2027-02-01', monthly_cost: 799.0, current_mileage: 8500, max_mileage: 45000 },
  },
];

// ─── Helpers ────────────────────────────────────────────────────────────────

function findContract(type: string, value: string): Contract | undefined {
  switch (type) {
    case 'phone':
      return contracts.find((c) => c.phone === value);
    case 'license_plate':
      return contracts.find((c) => c.license_plate === value);
    case 'contract_number':
      return contracts.find((c) => c.contract_number === value);
    default:
      return undefined;
  }
}

// ─── In-memory termination log ──────────────────────────────────────────────

const terminationLog: Array<{ timestamp: string; call_id: string; contract_number: string; status: string }> = [];

// ─── Routes ─────────────────────────────────────────────────────────────────

// Health
nl.get('/health', (c) => {
  return c.json({ status: 'ok', service: 'plant0-nl-early-termination', contracts_loaded: contracts.length });
});

// Lookup
nl.post('/lookup', async (c) => {
  const body = await c.req.json();
  const { lookup_key_type, lookup_key_value, call_id } = body;

  console.log(`[LOOKUP] type=${lookup_key_type} value=${lookup_key_value} call_id=${call_id ?? 'n/a'}`);

  if (!lookup_key_type || !lookup_key_value) {
    return c.json({ error: 'lookup_key_type and lookup_key_value are required' }, 400);
  }

  const contract = findContract(lookup_key_type, lookup_key_value);

  if (!contract) {
    console.log(`[LOOKUP] not found`);
    return c.json({ status: 'not_found' });
  }

  console.log(`[LOOKUP] found contract=${contract.contract_number}`);
  return c.json({
    status: 'found',
    contract_number: contract.contract_number,
    license_plate: contract.license_plate,
    postal_code: contract.postal_code,
    house_number: contract.house_number,
    date_of_birth: contract.date_of_birth,
    customer: contract.customer,
    vehicle: contract.vehicle,
    product: contract.product,
    offerte_template: contract.offerte_template,
    contract_details: contract.contract_details,
  });
});

// Early termination webhook
nl.post('/webhook/early-termination', async (c) => {
  const body = await c.req.json();
  const { call_id, contract_number, license_plate, product, termination_end_date, expected_mileage } = body;

  console.log(`[EARLY-TERM] call_id=${call_id} contract=${contract_number} product=${product}`);

  // Basic validation
  if (!call_id || !contract_number || !product || !termination_end_date) {
    console.log(`[EARLY-TERM] validation failed - missing required fields`);
    return c.json({ final_status: 'technical_error', message: 'Missing required fields: call_id, contract_number, product, termination_end_date' }, 400);
  }

  // Verify contract exists
  const contract = findContract('contract_number', contract_number);
  if (!contract) {
    console.log(`[EARLY-TERM] contract not found: ${contract_number}`);
    return c.json({ final_status: 'technical_error', message: `Contract ${contract_number} not found` });
  }

  // Simulate processing logic
  const termDate = new Date(termination_end_date);
  const contractEnd = new Date(contract.contract_details.end_date);

  // If termination date is after contract end → manual required
  if (termDate > contractEnd) {
    console.log(`[EARLY-TERM] manual_required - termination date after contract end`);
    terminationLog.push({ timestamp: new Date().toISOString(), call_id, contract_number, status: 'manual_required' });
    return c.json({ final_status: 'manual_required', message: 'Termination date exceeds contract end date. Manual review required.' });
  }

  // If mileage exceeds max → manual required
  if (expected_mileage && expected_mileage > contract.contract_details.max_mileage) {
    console.log(`[EARLY-TERM] manual_required - mileage exceeds max`);
    terminationLog.push({ timestamp: new Date().toISOString(), call_id, contract_number, status: 'manual_required' });
    return c.json({ final_status: 'manual_required', message: 'Expected mileage exceeds contract maximum. Manual review required.' });
  }

  // Success
  console.log(`[EARLY-TERM] success`);
  terminationLog.push({ timestamp: new Date().toISOString(), call_id, contract_number, status: 'success' });
  return c.json({ final_status: 'success', message: `Early termination processed for ${contract_number} (${product})` });
});

export default nl;
