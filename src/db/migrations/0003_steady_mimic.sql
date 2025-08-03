CREATE TABLE "actions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"action" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp,
	"created_by" bigint NOT NULL,
	"modified_by" bigint,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "checkup_schedules" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"vehicle_id" bigint NOT NULL,
	"vehicle_action_id" bigint,
	"status" varchar(255) NOT NULL,
	"created_by" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_by" bigint,
	"modified_at" timestamp,
	"is_complied" boolean DEFAULT false NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cities" (
	"id" bigint PRIMARY KEY NOT NULL,
	"city_name" varchar(255) NOT NULL,
	"state" varchar(255) NOT NULL,
	"state_acronym" varchar(255),
	"region" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"document" text NOT NULL,
	"contact" text NOT NULL,
	"email" text NOT NULL,
	"created_by" bigint NOT NULL,
	"modified_by" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp,
	"deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "companies_document_unique" UNIQUE("document")
);
--> statement-breakpoint
CREATE TABLE "company_addresses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"company_id" bigint NOT NULL,
	"type" varchar(255) NOT NULL,
	"description" varchar(255),
	"postal_code" bigint NOT NULL,
	"street" varchar(255) NOT NULL,
	"complement" varchar(255),
	"reference" varchar(255),
	"number" bigint NOT NULL,
	"neighbourhood" varchar(255) NOT NULL,
	"city_id" bigint NOT NULL,
	"state" varchar(255) NOT NULL,
	"region" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp,
	"created_by" bigint NOT NULL,
	"modified_by" bigint NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "controllers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"controller" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp,
	"created_by" bigint NOT NULL,
	"modified_by" bigint,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cost_centers" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255),
	"department_id" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp,
	"created_by" bigint NOT NULL,
	"modified_by" bigint,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp,
	"created_by" bigint NOT NULL,
	"modified_by" bigint,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "garage_addresses" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"garage_id" bigint NOT NULL,
	"type" varchar(255) NOT NULL,
	"description" varchar(255),
	"postal_code" bigint NOT NULL,
	"street" varchar(255) NOT NULL,
	"number" bigint NOT NULL,
	"neighbourhood" varchar(255) NOT NULL,
	"city_id" bigint NOT NULL,
	"state" varchar(255) NOT NULL,
	"region" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp,
	"created_by" bigint NOT NULL,
	"modified_by" bigint NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "garages" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(255) NOT NULL,
	"vacancies" bigint NOT NULL,
	"address_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp,
	"created_by" bigint NOT NULL,
	"modified_by" bigint,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "logs" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"user_id" bigint,
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profile_permissions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"profile_id" bigint,
	"controller_id" bigint,
	"action_id" bigint,
	"permission" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"created_by" bigint,
	"modified_by" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp,
	"deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "profiles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "vehicle_action_types" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"checklist_template" jsonb,
	"created_by" bigint NOT NULL,
	"modified_by" bigint,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_actions" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"vehicle_id" bigint NOT NULL,
	"user_id" bigint NOT NULL,
	"vehicle_action_type_id" bigint NOT NULL,
	"milleage" bigint NOT NULL,
	"checklist" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp,
	"modified_by" bigint,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_contracts" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"company_id" bigint NOT NULL,
	"milleage_limit" bigint NOT NULL,
	"contract_total_amount" numeric(10, 2) NOT NULL,
	"tax_amount" numeric(10, 2) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp,
	"created_by" bigint NOT NULL,
	"modified_by" bigint NOT NULL,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicle_models" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"make" varchar(255) NOT NULL,
	"year" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp,
	"created_by" bigint NOT NULL,
	"modified_by" bigint,
	"deleted" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"plate" varchar(255) NOT NULL,
	"milleage" bigint DEFAULT 0 NOT NULL,
	"vehicle_model_id" bigint NOT NULL,
	"cost_center_id" bigint NOT NULL,
	"vehicle_contract_id" bigint NOT NULL,
	"garage_id" bigint NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"modified_at" timestamp,
	"created_by" bigint NOT NULL,
	"modified_by" bigint,
	"deleted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "vehicles_plate_unique" UNIQUE("plate")
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "profile_id" bigserial NOT NULL;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "actions" ADD CONSTRAINT "actions_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkup_schedules" ADD CONSTRAINT "checkup_schedules_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkup_schedules" ADD CONSTRAINT "checkup_schedules_vehicle_action_id_vehicle_actions_id_fk" FOREIGN KEY ("vehicle_action_id") REFERENCES "public"."vehicle_actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkup_schedules" ADD CONSTRAINT "checkup_schedules_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checkup_schedules" ADD CONSTRAINT "checkup_schedules_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_addresses" ADD CONSTRAINT "company_addresses_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_addresses" ADD CONSTRAINT "company_addresses_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "controllers" ADD CONSTRAINT "controllers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "controllers" ADD CONSTRAINT "controllers_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_department_id_departments_id_fk" FOREIGN KEY ("department_id") REFERENCES "public"."departments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cost_centers" ADD CONSTRAINT "cost_centers_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "departments" ADD CONSTRAINT "departments_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garage_addresses" ADD CONSTRAINT "garage_addresses_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garage_addresses" ADD CONSTRAINT "garage_addresses_city_id_cities_id_fk" FOREIGN KEY ("city_id") REFERENCES "public"."cities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garage_addresses" ADD CONSTRAINT "garage_addresses_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garage_addresses" ADD CONSTRAINT "garage_addresses_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garages" ADD CONSTRAINT "garages_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "garages" ADD CONSTRAINT "garages_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "logs" ADD CONSTRAINT "logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_permissions" ADD CONSTRAINT "profile_permissions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_permissions" ADD CONSTRAINT "profile_permissions_controller_id_controllers_id_fk" FOREIGN KEY ("controller_id") REFERENCES "public"."controllers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profile_permissions" ADD CONSTRAINT "profile_permissions_action_id_actions_id_fk" FOREIGN KEY ("action_id") REFERENCES "public"."actions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_action_types" ADD CONSTRAINT "vehicle_action_types_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_action_types" ADD CONSTRAINT "vehicle_action_types_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_actions" ADD CONSTRAINT "vehicle_actions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_actions" ADD CONSTRAINT "vehicle_actions_vehicle_action_type_id_vehicle_action_types_id_fk" FOREIGN KEY ("vehicle_action_type_id") REFERENCES "public"."vehicle_action_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_actions" ADD CONSTRAINT "vehicle_actions_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_contracts" ADD CONSTRAINT "vehicle_contracts_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_models" ADD CONSTRAINT "vehicle_models_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicle_models" ADD CONSTRAINT "vehicle_models_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_vehicle_model_id_vehicle_models_id_fk" FOREIGN KEY ("vehicle_model_id") REFERENCES "public"."vehicle_models"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_cost_center_id_cost_centers_id_fk" FOREIGN KEY ("cost_center_id") REFERENCES "public"."cost_centers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_vehicle_contract_id_vehicle_contracts_id_fk" FOREIGN KEY ("vehicle_contract_id") REFERENCES "public"."vehicle_contracts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_garage_id_garages_id_fk" FOREIGN KEY ("garage_id") REFERENCES "public"."garages"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_modified_by_users_id_fk" FOREIGN KEY ("modified_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;