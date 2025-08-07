import { actions } from "./actions.ts";
import { checkup_schedules } from "./checkup_schedules.ts";
import { cities } from "./cities.ts";
import { companies } from "./companies.ts";
import { company_addresses } from "./company_addresses.ts";
import { controllers } from "./controllers.ts";
import { cost_centers } from "./cost_centers.ts";
import { departments } from "./departments.ts";
import { garage_addresses } from "./garage_addresses.ts";
import { garages } from "./garages.ts";
import { logs } from "./logs.ts";
import { profile_permissions } from "./profile_permissions.ts";
import { profiles } from "./profiles.ts";
import { refreshTokens } from "./refresh_tokens.ts";
import { users } from "./users.ts";
import { vehicle_action_types } from "./vehicle_action_types.ts";
import { vehicle_actions } from "./vehicle_actions.ts";
import { vehicle_contracts } from "./vehicle_contracts.ts";
import { vehicle_models } from "./vehicle_models.ts";
import { vehicles } from "./vehicles.ts";

export const schema = {
	users,
	profiles,
	companies,
	logs,
	actions,
	controllers,
	profile_permissions,
	departments,
	vehicle_models,
	cost_centers,
	vehicle_contracts,
	company_addresses,
	garages,
	garage_addresses,
	vehicles,
	vehicle_action_types,
	vehicle_actions,
	checkup_schedules,
	cities,
	refreshTokens,
};
