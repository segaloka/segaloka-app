DO $$
DECLARE
    auth_principals regclass := to_regclass('auth.principals');
    auth_bindings regclass := to_regclass('auth.principal_bindings');
    iam_principals regclass := to_regclass('iam.principals');
    iam_bindings regclass := to_regclass('iam.principal_bindings');

    principals_columns_match boolean;
    bindings_columns_match boolean;

    principals_constraints_match boolean;
    bindings_constraints_match boolean;

    bindings_index_match boolean;
BEGIN
    /*
     * Canonical state.
     *
     * Both Segaloka IAM relations already live in iam and neither legacy
     * relation exists in auth. Nothing must be changed.
     */
    IF iam_principals IS NOT NULL
       AND iam_bindings IS NOT NULL
       AND auth_principals IS NULL
       AND auth_bindings IS NULL THEN
        RETURN;
    END IF;

    /*
     * Only an exact legacy pair is eligible for repair.
     *
     * Any mixed, partial, or collision state is rejected before structural
     * fingerprinting. This is intentionally fail-closed because auth may be
     * owned by an external authentication provider.
     */
    IF auth_principals IS NULL
       OR auth_bindings IS NULL
       OR iam_principals IS NOT NULL
       OR iam_bindings IS NOT NULL THEN
        RAISE EXCEPTION
            'IAM schema repair refused: expected either canonical iam pair or isolated legacy auth pair'
            USING ERRCODE = '55000';
    END IF;

    /*
     * Exact column fingerprint: auth.principals
     */
    SELECT
        count(*) = 5
        AND count(*) FILTER (
            WHERE a.attname = 'id'
              AND format_type(a.atttypid, a.atttypmod) = 'uuid'
              AND a.attnotnull
        ) = 1
        AND count(*) FILTER (
            WHERE a.attname = 'identity_id'
              AND format_type(a.atttypid, a.atttypmod) = 'uuid'
              AND NOT a.attnotnull
        ) = 1
        AND count(*) FILTER (
            WHERE a.attname = 'status'
              AND format_type(a.atttypid, a.atttypmod) = 'text'
              AND a.attnotnull
        ) = 1
        AND count(*) FILTER (
            WHERE a.attname = 'created_at'
              AND format_type(a.atttypid, a.atttypmod) =
                  'timestamp with time zone'
              AND a.attnotnull
              AND pg_get_expr(d.adbin, d.adrelid) = 'now()'
        ) = 1
        AND count(*) FILTER (
            WHERE a.attname = 'updated_at'
              AND format_type(a.atttypid, a.atttypmod) =
                  'timestamp with time zone'
              AND a.attnotnull
              AND pg_get_expr(d.adbin, d.adrelid) = 'now()'
        ) = 1
    INTO principals_columns_match
    FROM pg_attribute a
    LEFT JOIN pg_attrdef d
      ON d.adrelid = a.attrelid
     AND d.adnum = a.attnum
    WHERE a.attrelid = auth_principals
      AND a.attnum > 0
      AND NOT a.attisdropped;

    /*
     * Exact column fingerprint: auth.principal_bindings
     */
    SELECT
        count(*) = 7
        AND count(*) FILTER (
            WHERE a.attname = 'id'
              AND format_type(a.atttypid, a.atttypmod) = 'uuid'
              AND a.attnotnull
        ) = 1
        AND count(*) FILTER (
            WHERE a.attname = 'principal_id'
              AND format_type(a.atttypid, a.atttypmod) = 'uuid'
              AND a.attnotnull
        ) = 1
        AND count(*) FILTER (
            WHERE a.attname = 'issuer'
              AND format_type(a.atttypid, a.atttypmod) = 'text'
              AND a.attnotnull
        ) = 1
        AND count(*) FILTER (
            WHERE a.attname = 'subject'
              AND format_type(a.atttypid, a.atttypmod) = 'text'
              AND a.attnotnull
        ) = 1
        AND count(*) FILTER (
            WHERE a.attname = 'status'
              AND format_type(a.atttypid, a.atttypmod) = 'text'
              AND a.attnotnull
        ) = 1
        AND count(*) FILTER (
            WHERE a.attname = 'created_at'
              AND format_type(a.atttypid, a.atttypmod) =
                  'timestamp with time zone'
              AND a.attnotnull
              AND pg_get_expr(d.adbin, d.adrelid) = 'now()'
        ) = 1
        AND count(*) FILTER (
            WHERE a.attname = 'updated_at'
              AND format_type(a.atttypid, a.atttypmod) =
                  'timestamp with time zone'
              AND a.attnotnull
              AND pg_get_expr(d.adbin, d.adrelid) = 'now()'
        ) = 1
    INTO bindings_columns_match
    FROM pg_attribute a
    LEFT JOIN pg_attrdef d
      ON d.adrelid = a.attrelid
     AND d.adnum = a.attnum
    WHERE a.attrelid = auth_bindings
      AND a.attnum > 0
      AND NOT a.attisdropped;

    /*
     * Exact constraint graph: principals.
     *
     * Expected:
     *   - primary key(id)
     *   - unique(identity_id)
     *   - status check
     *   - FK identity_id -> identity.identities(id)
     *
     * conkey/confkey arrays are compared directly so the fingerprint verifies
     * the constrained columns as well as the target relations.
     */
    SELECT
        count(*) = 4
        AND count(*) FILTER (
            WHERE c.contype = 'p'
              AND c.conname = 'principals_pkey'
              AND c.conkey = ARRAY[
                    (
                        SELECT attnum
                        FROM pg_attribute
                        WHERE attrelid = auth_principals
                          AND attname = 'id'
                          AND NOT attisdropped
                    )
                  ]::smallint[]
        ) = 1
        AND count(*) FILTER (
            WHERE c.contype = 'u'
              AND c.conname = 'principals_identity_id_unique'
              AND c.conkey = ARRAY[
                    (
                        SELECT attnum
                        FROM pg_attribute
                        WHERE attrelid = auth_principals
                          AND attname = 'identity_id'
                          AND NOT attisdropped
                    )
                  ]::smallint[]
        ) = 1
        AND count(*) FILTER (
            WHERE c.contype = 'c'
              AND c.conname = 'principals_status_check'
              AND pg_get_constraintdef(c.oid, true)
                  LIKE '%status%ACTIVE%SUSPENDED%REVOKED%'
        ) = 1
        AND count(*) FILTER (
            WHERE c.contype = 'f'
              AND c.conname =
                  'principals_identity_id_identities_id_fk'
              AND c.confrelid =
                  to_regclass('identity.identities')
              AND c.conkey = ARRAY[
                    (
                        SELECT attnum
                        FROM pg_attribute
                        WHERE attrelid = auth_principals
                          AND attname = 'identity_id'
                          AND NOT attisdropped
                    )
                  ]::smallint[]
              AND c.confkey = ARRAY[
                    (
                        SELECT attnum
                        FROM pg_attribute
                        WHERE attrelid =
                            to_regclass('identity.identities')
                          AND attname = 'id'
                          AND NOT attisdropped
                    )
                  ]::smallint[]
              AND c.confupdtype = 'a'
              AND c.confdeltype = 'a'
        ) = 1
    INTO principals_constraints_match
    FROM pg_constraint c
    WHERE c.conrelid = auth_principals;

    /*
     * Exact constraint graph: principal_bindings.
     *
     * Expected:
     *   - primary key(id)
     *   - unique(issuer, subject)
     *   - three checks
     *   - FK principal_id -> auth.principals(id)
     */
    SELECT
        count(*) = 6
        AND count(*) FILTER (
            WHERE c.contype = 'p'
              AND c.conname = 'principal_bindings_pkey'
        ) = 1
        AND count(*) FILTER (
            WHERE c.contype = 'u'
              AND c.conname =
                  'principal_bindings_issuer_subject_unique'
              AND c.conkey = ARRAY[
                    (
                        SELECT attnum
                        FROM pg_attribute
                        WHERE attrelid = auth_bindings
                          AND attname = 'issuer'
                          AND NOT attisdropped
                    ),
                    (
                        SELECT attnum
                        FROM pg_attribute
                        WHERE attrelid = auth_bindings
                          AND attname = 'subject'
                          AND NOT attisdropped
                    )
                  ]::smallint[]
        ) = 1
        AND count(*) FILTER (
            WHERE c.contype = 'c'
              AND c.conname =
                  'principal_bindings_issuer_non_empty_check'
              AND pg_get_constraintdef(c.oid, true)
                  LIKE '%issuer%'
        ) = 1
        AND count(*) FILTER (
            WHERE c.contype = 'c'
              AND c.conname =
                  'principal_bindings_subject_non_empty_check'
              AND pg_get_constraintdef(c.oid, true)
                  LIKE '%subject%'
        ) = 1
        AND count(*) FILTER (
            WHERE c.contype = 'c'
              AND c.conname =
                  'principal_bindings_status_check'
              AND pg_get_constraintdef(c.oid, true)
                  LIKE '%status%ACTIVE%REVOKED%'
        ) = 1
        AND count(*) FILTER (
            WHERE c.contype = 'f'
              AND c.conname =
                  'principal_bindings_principal_id_principals_id_fk'
              AND c.confrelid = auth_principals
              AND c.conkey = ARRAY[
                    (
                        SELECT attnum
                        FROM pg_attribute
                        WHERE attrelid = auth_bindings
                          AND attname = 'principal_id'
                          AND NOT attisdropped
                    )
                  ]::smallint[]
              AND c.confkey = ARRAY[
                    (
                        SELECT attnum
                        FROM pg_attribute
                        WHERE attrelid = auth_principals
                          AND attname = 'id'
                          AND NOT attisdropped
                    )
                  ]::smallint[]
              AND c.confupdtype = 'a'
              AND c.confdeltype = 'a'
        ) = 1
    INTO bindings_constraints_match
    FROM pg_constraint c
    WHERE c.conrelid = auth_bindings;

    /*
     * The only non-constraint secondary index in historical 0001.
     * Constraint-backed indexes are represented by pg_constraint and are
     * deliberately excluded here.
     */
    SELECT
        count(*) = 1
        AND count(*) FILTER (
            WHERE i.indisvalid
              AND i.indisready
              AND NOT i.indisunique
              AND i.indkey::text = (
                    SELECT attnum::text
                    FROM pg_attribute
                    WHERE attrelid = auth_bindings
                      AND attname = 'principal_id'
                      AND NOT attisdropped
              )
              AND cls.relname =
                  'principal_bindings_principal_id_idx'
        ) = 1
    INTO bindings_index_match
    FROM pg_index i
    JOIN pg_class cls
      ON cls.oid = i.indexrelid
    LEFT JOIN pg_constraint constraint_owner
      ON constraint_owner.conindid = i.indexrelid
    WHERE i.indrelid = auth_bindings
      AND constraint_owner.oid IS NULL;

    IF NOT principals_columns_match
       OR NOT bindings_columns_match
       OR NOT principals_constraints_match
       OR NOT bindings_constraints_match
       OR NOT bindings_index_match THEN
        RAISE EXCEPTION
            'IAM schema repair refused: auth relations do not match the historical Segaloka IAM fingerprint'
            USING ERRCODE = '55000';
    END IF;

    /*
     * Move only Segaloka-owned relations. Never rename or drop auth itself.
     *
     * PostgreSQL SET SCHEMA preserves the relation objects, their data,
     * indexes, constraints, and relation OIDs.
     */
    CREATE SCHEMA IF NOT EXISTS iam;

    ALTER TABLE auth.principals
        SET SCHEMA iam;

    ALTER TABLE auth.principal_bindings
        SET SCHEMA iam;
END
$$;
