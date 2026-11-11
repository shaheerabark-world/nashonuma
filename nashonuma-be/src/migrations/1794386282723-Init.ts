import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1794386282723 implements MigrationInterface {
    name = 'Init1794386282723'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role" AS ENUM('supervisor', 'clinician', 'programme', 'researcher', 'admin', 'parent')`);
        await queryRunner.query(`CREATE TABLE "users" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying(200) NOT NULL, "name" character varying(200) NOT NULL, "initials" character varying(4) NOT NULL, "job" character varying(100) NOT NULL, "role" "public"."user_role" NOT NULL, "phone" character varying(40), "password_hash" character varying(100) NOT NULL, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "morbas_assessments" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" character varying(40) NOT NULL, "child_id" character varying(40) NOT NULL, "date" date NOT NULL, "by" character varying(200) NOT NULL, "by_user_id" uuid, "scores" integer array NOT NULL, "marks" jsonb, CONSTRAINT "PK_fd6ad238b73e4acb441bc483c19" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ee4a23e954cd0085150a476dfe" ON "morbas_assessments" ("child_id") `);
        await queryRunner.query(`CREATE TABLE "children" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" character varying(40) NOT NULL, "name" character varying(200) NOT NULL, "sex" character varying(20) NOT NULL DEFAULT '—', "dob" date NOT NULL, "area" character varying(100) NOT NULL DEFAULT '—', "country" character varying(4), "mother_user_id" uuid, CONSTRAINT "PK_8c5a7cbebf2c702830ef38d22b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "wellbeing_reports" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" character varying(40) NOT NULL, "mother" character varying(200) NOT NULL, "phone" character varying(40), "baby" date, "date" date NOT NULL, "ans" smallint array NOT NULL, "help" character varying(20), "status" character varying(20) NOT NULL DEFAULT 'New', "submitted_by_id" uuid, CONSTRAINT "PK_635a3ee3b3b78ec9bd992e690de" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_8a5ae20776176032c969564736" ON "wellbeing_reports" ("date") `);
        await queryRunner.query(`CREATE INDEX "IDX_fc533de9c071594686b3711558" ON "wellbeing_reports" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_cf1033375d4af019b446679cd3" ON "wellbeing_reports" ("submitted_by_id") `);
        await queryRunner.query(`CREATE TABLE "parent_reports" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "id" character varying(40) NOT NULL, "kid" character varying(40) NOT NULL DEFAULT '', "name" character varying(200) NOT NULL, "dob" date, "sex" character varying(20), "mother" character varying(200), "phone" character varying(40), "date" date NOT NULL, "concerns" text array NOT NULL DEFAULT '{}', "note" text NOT NULL DEFAULT '', "worry" integer NOT NULL DEFAULT '0', "status" character varying(20) NOT NULL DEFAULT 'New', "instr" character varying(10), "country" character varying(4), "ans" jsonb NOT NULL DEFAULT '{}', "submitted_by_id" uuid, CONSTRAINT "PK_5c1357813ed0fb56042542d126d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_643d32a7865d2fb8f69799c4b3" ON "parent_reports" ("date") `);
        await queryRunner.query(`CREATE INDEX "IDX_8016527004a0aa5d7b0969ab3c" ON "parent_reports" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_476b19f22af666beb192886d74" ON "parent_reports" ("submitted_by_id") `);
        await queryRunner.query(`CREATE TABLE "app_config" ("created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "key" character varying(40) NOT NULL, "value" jsonb, "updated_by" character varying(200), CONSTRAINT "PK_e53f3c7882ebd6e79931e0fa959" PRIMARY KEY ("key"))`);
        await queryRunner.query(`ALTER TABLE "morbas_assessments" ADD CONSTRAINT "FK_ee4a23e954cd0085150a476dfed" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "morbas_assessments" ADD CONSTRAINT "FK_6b17916d3448ce4a4cd77048622" FOREIGN KEY ("by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "children" ADD CONSTRAINT "FK_1186acf2ef4ec9dece2a9eb1149" FOREIGN KEY ("mother_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wellbeing_reports" ADD CONSTRAINT "FK_cf1033375d4af019b446679cd33" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "parent_reports" ADD CONSTRAINT "FK_476b19f22af666beb192886d743" FOREIGN KEY ("submitted_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "parent_reports" DROP CONSTRAINT "FK_476b19f22af666beb192886d743"`);
        await queryRunner.query(`ALTER TABLE "wellbeing_reports" DROP CONSTRAINT "FK_cf1033375d4af019b446679cd33"`);
        await queryRunner.query(`ALTER TABLE "children" DROP CONSTRAINT "FK_1186acf2ef4ec9dece2a9eb1149"`);
        await queryRunner.query(`ALTER TABLE "morbas_assessments" DROP CONSTRAINT "FK_6b17916d3448ce4a4cd77048622"`);
        await queryRunner.query(`ALTER TABLE "morbas_assessments" DROP CONSTRAINT "FK_ee4a23e954cd0085150a476dfed"`);
        await queryRunner.query(`DROP TABLE "app_config"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_476b19f22af666beb192886d74"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8016527004a0aa5d7b0969ab3c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_643d32a7865d2fb8f69799c4b3"`);
        await queryRunner.query(`DROP TABLE "parent_reports"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_cf1033375d4af019b446679cd3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fc533de9c071594686b3711558"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8a5ae20776176032c969564736"`);
        await queryRunner.query(`DROP TABLE "wellbeing_reports"`);
        await queryRunner.query(`DROP TABLE "children"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ee4a23e954cd0085150a476dfe"`);
        await queryRunner.query(`DROP TABLE "morbas_assessments"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."user_role"`);
    }

}
