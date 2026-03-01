import {
  statisticsBaseQuery,
  periodsMap,
  STATISTICS_TYPE_MAPS,
  ASYLUM_STAT_PAGES_BASE_TITLES_MAP,
  MOCK_MONTHS,
  BORDER_CROSS_STAT_PAGES_BASE_TITLES_MAP,
  WP_SIMPLE_STAT_PAGES_BASE_TITLES_MAP,
} from './statistics.constants';

const sanitizeData = (data) => {
  return data.map(({ key, ...rowData }) => rowData);
};

const formatExcelMetaData = (statisticsType, filters) => {
  const headerRows = {
    [STATISTICS_TYPE_MAPS.B_CROSS_TOTAL]: [
      "",
      "ՀՀ քաղաքացիներ",
      "",
      "",
      "Օտարերկրացիներ",
      "",
      "",
      "Ընդամենը",
      "",
      "",
    ],
    [STATISTICS_TYPE_MAPS.B_CROSS_COUNTRIES]: [
      "Քաղաքացիություն",
      "Air",
      "",
      "",
      "Land",
      "",
      "",
      "Railway",
      "",
      "",
      "Total",
      "",
      "",
    ],
    [STATISTICS_TYPE_MAPS.B_CROSS_PERIOD]: [
      "...",
      "ՀՀ քաղաքացիներ",
      "",
      "",
      "Օտարերկրացիներ",
      "",
      "",
      "Ընդամենը",
      "",
      "",
    ],
    [STATISTICS_TYPE_MAPS.ASYLUM_TOTAL]: [
      "Քաղաքացիություն",
      "Հայցել է ապաստան",
      "Ճանաչվել է փախստական",
      "Մերժվել է",
      "Կարճվել է",
    ],
    [STATISTICS_TYPE_MAPS.ASYLUM_APPLICATIONS]: [
      "Քաղաքացիություն",
      "0-13 տարեկան",
      "",
      "",
      "14-17 տարեկան",
      "",
      "",
      "18-34 տարեկան",
      "",
      "",
      "35-64 տարեկան",
      "",
      "",
      "65-ից ավել",
      "",
      "",
      "անհայտ",
      "",
      "",
      "ԸՆԴԱՄԵՆԸ",
      "",
      "",
    ],
    [STATISTICS_TYPE_MAPS.ASYLUM_DECISIONS]: [
      "Քաղաքացիություն",
      "0-13 տարեկան",
      "",
      "",
      "14-17 տարեկան",
      "",
      "",
      "18-34 տարեկան",
      "",
      "",
      "35-64 տարեկան",
      "",
      "",
      "65-ից ավել",
      "",
      "",
      "անհայտ",
      "",
      "",
      "ԸՆԴԱՄԵՆԸ",
      "",
      "",
    ],
    [STATISTICS_TYPE_MAPS.ASYLUM_YEARS]: [
      "Տարեթիվ",
      "Հայցել է ապաստան",
      "Ճանաչվել է փախստական",
      "Մերժվել է",
      "Կարճվել է",
    ],
    [STATISTICS_TYPE_MAPS.WP_SIMPLE]: [
      "Քաղաքացիություն",
      "0-34 տարեկան",
      "",
      "",
      "35-64 տարեկան",
      "",
      "",
      "65-ից ավել",
      "",
      "",
      "ԸՆԴԱՄԵՆԸ",
      "",
      "",
    ],
  };
  const subHeaderRows = {
    [STATISTICS_TYPE_MAPS.B_CROSS_TOTAL]: [
      "",
      "In",
      "Out",
      "Net",
      "In",
      "Out",
      "Net",
      "In",
      "Out",
      "Net",
    ],
    [STATISTICS_TYPE_MAPS.B_CROSS_COUNTRIES]: [
      "",
      "In",
      "Out",
      "Net",
      "In",
      "Out",
      "Net",
      "In",
      "Out",
      "Net",
      "In",
      "Out",
      "Net",
    ],
    [STATISTICS_TYPE_MAPS.B_CROSS_PERIOD]: [
      "",
      "In",
      "Out",
      "Net",
      "In",
      "Out",
      "Net",
      "In",
      "Out",
      "Net",
    ],
    [STATISTICS_TYPE_MAPS.ASYLUM_TOTAL]: null,
    [STATISTICS_TYPE_MAPS.ASYLUM_APPLICATIONS]: [
      "",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
    ],
    [STATISTICS_TYPE_MAPS.ASYLUM_DECISIONS]: [
      "",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
    ],
    [STATISTICS_TYPE_MAPS.ASYLUM_YEARS]: null,
    [STATISTICS_TYPE_MAPS.WP_SIMPLE]: [
      "",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
      "Ի",
      "Ա",
      "Ընդ․",
    ],
  };
  const mergeCellRanges = {
    [STATISTICS_TYPE_MAPS.B_CROSS_TOTAL]: ["A1:J1", "B2:D2", "E2:G2", "H2:J2", "A2:A3"],
    [STATISTICS_TYPE_MAPS.B_CROSS_COUNTRIES]: [
      "A1:M1",
      "B2:D2",
      "E2:G2",
      "H2:J2",
      "K2:M2",
      "A2:A3",
    ],
    [STATISTICS_TYPE_MAPS.B_CROSS_PERIOD]: ["A1:J1", "B2:D2", "E2:G2", "H2:J2", "A2:A3"],
    [STATISTICS_TYPE_MAPS.ASYLUM_TOTAL]: ["A1:E1"],
    [STATISTICS_TYPE_MAPS.ASYLUM_APPLICATIONS]: [
      "A1:V1",
      "B2:D2",
      "E2:G2",
      "H2:J2",
      "K2:M2",
      "N2:P2",
      "Q2:S2",
      "T2:V2",
      "A2:A3",
    ],
    [STATISTICS_TYPE_MAPS.ASYLUM_DECISIONS]: [
      "A1:V1",
      "B2:D2",
      "E2:G2",
      "H2:J2",
      "K2:M2",
      "N2:P2",
      "Q2:S2",
      "T2:V2",
      "A2:A3",
    ],
    [STATISTICS_TYPE_MAPS.ASYLUM_YEARS]: ["A1:E1"],
    [STATISTICS_TYPE_MAPS.WP_SIMPLE]: [
      "A1:M1",
      "B2:D2",
      "E2:G2",
      "H2:J2",
      "K2:M2",
      "N2:P2",
      "A2:A3",
    ],
  };

  return {
    headerRows: headerRows[statisticsType],
    subHeaderRows: subHeaderRows[statisticsType],
    mergeCellRanges: mergeCellRanges[statisticsType],
  };
};

const mergeAndAlignCells = (workSheet, mergedCellsRange) => {
  if (!mergedCellsRange) return;
  mergedCellsRange.forEach((range) => {
    workSheet.mergeCells(range);
    const cell = workSheet.getCell(range.split(":")[0]);
    cell.alignment = { horizontal: "center", vertical: "middle" };
  });
};

const formatAsylumQuery = ({ table_name, year, month, period }) => {
  let quarter_where_condition = ` YEAR(d.decison_date) = ${year} AND`;
  let applications_quarter_where_condition = ` YEAR(cs.mul_date) = ${year}  `;

  if (period == periodsMap.H1) {
    quarter_where_condition += ` QUARTER(d.decison_date) IN (1,2) AND `;
    applications_quarter_where_condition += ` AND QUARTER(cs.mul_date) IN (1,2) `;
  } else if (period == periodsMap.H2) {
    quarter_where_condition += ` QUARTER(d.decison_date) IN (3,4)  AND `;
    applications_quarter_where_condition += ` AND QUARTER(cs.mul_date) IN (3,4)  `;
  } else if (period == periodsMap.Q1) {
    quarter_where_condition += ` QUARTER(d.decison_date) =1  AND `;
    applications_quarter_where_condition += ` AND QUARTER(cs.mul_date) =1  `;
  } else if (period == periodsMap.Q2) {
    quarter_where_condition += ` QUARTER(d.decison_date) =2  AND `;
    applications_quarter_where_condition += ` AND QUARTER(cs.mul_date) =2  `;
  } else if (period == periodsMap.Q3) {
    quarter_where_condition += ` QUARTER(d.decison_date) =3  AND `;
    applications_quarter_where_condition += ` AND QUARTER(cs.mul_date) =3  `;
  } else if (period == periodsMap.Q4) {
    quarter_where_condition += ` QUARTER(d.decison_date) =4  AND `;
    applications_quarter_where_condition += ` AND QUARTER(cs.mul_date) =4  `;
  } else if (period == periodsMap["9MONTHLY"]) {
    quarter_where_condition += ` QUARTER(d.decison_date) IN(1,2,3)  AND `;
    applications_quarter_where_condition += ` AND QUARTER(cs.mul_date) IN(1,2,3) `;
  } else if (period == periodsMap.MONTHLY && month) {
    quarter_where_condition += ` MONTH(d.decison_date) = ${month}  AND `;
    applications_quarter_where_condition += ` AND MONTH(cs.mul_date) =${month} `;
  }

  const statisticsQueriesFrom = {
    applied_for_asylum: ` FROM (
          SELECT    a.personal_id,    c.country_arm,    YEAR(cs.mul_date) - a.b_year AS age,    a.sex FROM    tb_person a 
          INNER JOIN tb_case cs ON cs.case_id = a.case_id 
          INNER JOIN tb_country c ON    a.citizenship = c.country_id 
          WHERE ${applications_quarter_where_condition}  ) EAEU_STAT    
      group by EAEU_STAT.country_arm`,
    refugees: ` FROM (
          SELECT    
          a.personal_id,    
          c.country_arm,    
          YEAR(d.decison_date) - a.b_year AS age,    
          a.sex 
            FROM tb_person a 
            INNER JOIN tb_decisions d ON d.case_id = a.case_id 
            INNER JOIN tb_country c ON    a.citizenship = c.country_id 
            WHERE ${quarter_where_condition}  
              a.person_status = 2 
              AND d.decision_type=3 
              AND d.decision_status=5 
              AND d.actual=1) EAEU_STAT    
      group by EAEU_STAT.country_arm`,
    refugees_withdrawn: ` FROM (
          SELECT    a.personal_id,    c.country_arm,    YEAR(d.decison_date) - a.b_year AS age,    a.sex FROM    tb_person a 
          INNER JOIN tb_decisions d ON d.case_id = a.case_id 
          INNER JOIN tb_country c ON    a.citizenship = c.country_id 
          WHERE ${quarter_where_condition}  d.decision_type IN(11,13) AND d.actual=1 ) EAEU_STAT    
      group by EAEU_STAT.country_arm`,
    terminate: ` FROM (
          SELECT    a.personal_id,    c.country_arm,    YEAR(d.decison_date) - a.b_year AS age,    a.sex FROM    tb_person a 
          INNER JOIN tb_decisions d ON d.case_id = a.case_id 
          INNER JOIN tb_country c ON    a.citizenship = c.country_id 
          WHERE ${quarter_where_condition}  d.decision_type IN(11,12) AND d.actual=1 AND d.decision_status=5) EAEU_STAT    
      group by EAEU_STAT.country_arm`,
    denied_refugees: ` FROM (
          SELECT    a.personal_id,    c.country_arm,    YEAR(d.decison_date) - a.b_year AS age,    a.sex FROM    tb_person a 
          INNER JOIN tb_decisions d ON d.case_id = a.case_id 
          INNER JOIN tb_country c ON    a.citizenship = c.country_id 
          WHERE ${quarter_where_condition}  d.decision_type=4 AND d.actual=1 AND d.decision_status=5) EAEU_STAT    
      group by EAEU_STAT.country_arm`,
    asylum_closed: `  
    FROM (
          SELECT    a.personal_id,    c.country_arm,    YEAR(d.decison_date) - a.b_year AS age,    a.sex FROM    tb_person a 
          INNER JOIN tb_decisions d ON d.case_id = a.case_id 
          INNER JOIN tb_country c ON    a.citizenship = c.country_id 
          WHERE ${quarter_where_condition}  d.decision_type=5 AND d.actual=1 AND d.decision_status=5) EAEU_STAT
          LEFT JOIN (
            SELECT
              c.country_arm,
              COUNT(d.case_id) AS TOTAL_APPLICATIONS
            FROM
              tb_decisions d
              INNER JOIN tb_case csa ON csa.case_id=d.case_id
              INNER JOIN tb_person prs on prs.case_id=csa.case_id AND prs.role=1
            INNER JOIN
              tb_country c ON prs.citizenship = c.country_id
            WHERE 
              ${quarter_where_condition} 
              d.decision_type = 5
              AND d.actual = 1
            GROUP BY
              c.country_arm
          ) APP_STATS ON EAEU_STAT.country_arm = APP_STATS.country_arm    
      group by EAEU_STAT.country_arm`,
  };
  return statisticsBaseQuery + statisticsQueriesFrom[table_name];
};

const formatTotalAsylumQuery = ({ year, month, period }) => {
  let periodWhereCondition = "";
  if (period == periodsMap.H1) {
    periodWhereCondition += ` AND QUARTER(asylum_general_stats.period) IN (1,2) `;
  } else if (period == periodsMap.H2) {
    periodWhereCondition += ` AND QUARTER(asylum_general_stats.period) IN (3,4)  `;
  } else if (period == periodsMap.Q1) {
    periodWhereCondition += ` AND QUARTER(asylum_general_stats.period) =1 `;
  } else if (period == periodsMap.Q2) {
    periodWhereCondition += ` AND QUARTER(asylum_general_stats.period) =2 `;
  } else if (period == periodsMap.Q3) {
    periodWhereCondition += ` AND QUARTER(asylum_general_stats.period) =3  `;
  } else if (period == periodsMap.Q4) {
    periodWhereCondition += ` AND QUARTER(asylum_general_stats.period) =4  `;
  } else if (period == periodsMap["9MONTHLY"]) {
    periodWhereCondition += ` AND QUARTER(asylum_general_stats.period) IN(1,2,3) `;
  }
  const whereCondition = month
    ? ` YEAR(asylum_general_stats.period) = '${year}' and MONTH(asylum_general_stats.period) = ${month} `
    : ` YEAR(asylum_general_stats.period) = '${year}'  ${periodWhereCondition} `;

  const query = `SELECT
  asylum_general_stats.country_id AS 'key',
  asylum_general_stats.country_arm,

  COUNT(
    IF(asylum_general_stats.TABLE_NAME = 'table_1',
       asylum_general_stats.count_parametr, NULL)
  ) AS asylum_seeker,

  COUNT(
    IF(asylum_general_stats.TABLE_NAME = 'table_2'
       AND asylum_general_stats.decision_type = 3,
       asylum_general_stats.count_parametr, NULL)
  ) AS positive_decisions,

  COUNT(
    IF(asylum_general_stats.TABLE_NAME = 'table_2'
       AND asylum_general_stats.decision_type = 4,
       asylum_general_stats.count_parametr, NULL)
  ) AS negative_decisions,

  COUNT(
    IF(asylum_general_stats.TABLE_NAME = 'table_2'
       AND asylum_general_stats.decision_type = 5,
       asylum_general_stats.count_parametr, NULL)
  ) AS cease_decisions

FROM (
      SELECT
          a.case_id,
          b.personal_id AS count_parametr,
          a.mul_date AS period,
          c.country_id,
          c.country_arm,
          c.country_eng,
          NULL AS decision_type,
          'table_1' AS TABLE_NAME
      FROM tb_case a
      INNER JOIN tb_person b ON a.case_id = b.case_id
      INNER JOIN tb_country c ON b.citizenship = c.country_id

      UNION ALL

      SELECT
          d.case_id,
          prs.personal_id AS count_parametr,     
          DATE(d.decison_date) AS period,
          cn.country_id,
          cn.country_arm,
          cn.country_eng,
          d.decision_type AS decision_type,
          'table_2' AS TABLE_NAME
      FROM tb_decisions d
      INNER JOIN tb_case cs ON cs.case_id = d.case_id
      INNER JOIN tb_person prs ON prs.case_id = cs.case_id
      INNER JOIN tb_country cn ON prs.citizenship = cn.country_id
      WHERE
          d.decision_status = 5         
          AND d.actual = 1              
  ) AS asylum_general_stats

WHERE ${whereCondition}
GROUP BY asylum_general_stats.country_id, asylum_general_stats.country_arm
`;

  return query;
};

const formatTotalBorderCrossQuery = ({ year, month, period, borderCross }) => {
  borderCross === "type" ? "" : "";
  const mainColumnNames = { type: "cross_type", point: "cross_point" };
  const periodConditions = {
    h1: "  AND month IN (1,2,3,4,5,6)",
    h2: "  AND month IN (7,8,9,10,11,12)",
    annual: "",
    q1: "  AND month IN (1,2,3)",
    q2: "  AND month IN (4,5,6)",
    q3: "  AND month IN (7,8,9)",
    q4: "  AND month IN (10,11,12)",
    "9monthly": "  AND month IN (1,2,3,4,5,6,7,8,9)",
    monthly: ` AND month = ${month}`,
  };

  const baseQuery = `SELECT 
        ${mainColumnNames[borderCross]} AS main_column, 
          SUM(CASE WHEN country = 'ARMENIA' THEN in_count ELSE 0 END) AS arm_in,
          SUM(CASE WHEN country = 'ARMENIA' THEN out_count ELSE 0 END) AS arm_out,
          SUM(CASE WHEN country = 'ARMENIA' THEN in_count ELSE 0 END) - SUM(CASE WHEN country = 'ARMENIA' THEN out_count ELSE 0 END) AS arm_net,
          SUM(CASE WHEN country <> 'ARMENIA' THEN in_count ELSE 0 END) AS other_in,
          SUM(CASE WHEN country <> 'ARMENIA' THEN out_count ELSE 0 END) AS other_out,
          SUM(CASE WHEN country <> 'ARMENIA' THEN in_count ELSE 0 END) - SUM(CASE WHEN country <> 'ARMENIA' THEN out_count ELSE 0 END) AS other_net,
          SUM(in_count) AS total_in,
          SUM(out_count) AS total_out,
          SUM(in_count) - SUM(out_count) AS total_net
      FROM crosses 
      WHERE 
          year = ${year} 
          ${periodConditions[period]}
      GROUP BY 
          ${mainColumnNames[borderCross]};`;

  return baseQuery;
};

const formatCountryBorderCrossQuery = ({ year, month, period }) => {
  const periodConditions = {
    h1: "  AND month IN (1,2,3,4,5,6)",
    h2: "  AND month IN (7,8,9,10,11,12)",
    annual: "",
    q1: "  AND month IN (1,2,3)",
    q2: "  AND month IN (4,5,6)",
    q3: "  AND month IN (7,8,9)",
    q4: "  AND month IN (10,11,12)",
    "9monthly": "  AND month IN (1,2,3,4,5,6,7,8,9)",
    monthly: ` AND month = ${month}`,
  };

  const baseQuery = `SELECT 
        country, 
          SUM(CASE WHEN cross_type = 'AIR' THEN in_count ELSE 0 END) AS air_in,
          SUM(CASE WHEN cross_type = 'AIR' THEN out_count ELSE 0 END) AS air_out,
          SUM(CASE WHEN cross_type = 'AIR' THEN in_count ELSE 0 END) - SUM(CASE WHEN cross_type = 'AIR' THEN out_count ELSE 0 END) AS air_net,
          SUM(CASE WHEN cross_type = 'LAND' THEN in_count ELSE 0 END) AS land_in,
          SUM(CASE WHEN cross_type = 'LAND' THEN out_count ELSE 0 END) AS land_out,
          SUM(CASE WHEN cross_type = 'LAND' THEN in_count ELSE 0 END) - SUM(CASE WHEN cross_type = 'LAND' THEN out_count ELSE 0 END) AS land_net,
          SUM(CASE WHEN cross_type = 'RAILWAY' THEN in_count ELSE 0 END) AS railway_in,
          SUM(CASE WHEN cross_type = 'RAILWAY' THEN out_count ELSE 0 END) AS railway_out,
          SUM(CASE WHEN cross_type = 'RAILWAY' THEN in_count ELSE 0 END) - SUM(CASE WHEN cross_type = 'RAILWAY' THEN out_count ELSE 0 END) AS railway_net,
          SUM(in_count) AS total_in,
          SUM(out_count) AS total_out,
          SUM(in_count) - SUM(out_count) AS total_net
      FROM crosses 
      WHERE 
          year = ${year} 
          ${periodConditions[period]}
      GROUP BY 
          country;`;

  return baseQuery;
};

const formatPeriodBorderCrossQuery = ({ year, month, period }) => {
  switch (period) {
    case periodsMap.ANNUAL:
      return `SELECT 
            year AS main_column,
            year AS 'key',
            SUM(CASE WHEN country = 'ARMENIA' THEN in_count ELSE 0 END) AS arm_in,
            SUM(CASE WHEN country = 'ARMENIA' THEN out_count ELSE 0 END) AS arm_out,
            SUM(CASE WHEN country = 'ARMENIA' THEN in_count ELSE 0 END) - SUM(CASE WHEN country = 'ARMENIA' THEN out_count ELSE 0 END) AS arm_net,
            SUM(CASE WHEN country <> 'ARMENIA' THEN in_count ELSE 0 END) AS other_in,
            SUM(CASE WHEN country <> 'ARMENIA' THEN out_count ELSE 0 END) AS other_out,
            SUM(CASE WHEN country <> 'ARMENIA' THEN in_count ELSE 0 END) - SUM(CASE WHEN country <> 'ARMENIA' THEN out_count ELSE 0 END) AS other_net,
            SUM(in_count) AS total_in,
            SUM(out_count) AS total_out,
            SUM(in_count) - SUM(out_count) AS total_net
        FROM 
            crosses
        WHERE 
            year IN (${year})
        GROUP BY 
            year
        ORDER BY 
            year DESC;`;
    case periodsMap.Q1:
      return quarterlyQueryBuilder(year, 1);
    case periodsMap.Q2:
      return quarterlyQueryBuilder(year, 2);
    case periodsMap.Q3:
      return quarterlyQueryBuilder(year, 3);
    case periodsMap.Q4:
      return quarterlyQueryBuilder(year, 4);
    case periodsMap.H1:
      return halfyearQueryBuilder(year, 1);
    case periodsMap.H2:
      return halfyearQueryBuilder(year, 2);
    case periodsMap.MONTHLY:
      return `SELECT 
          CONCAT(year, '-', LPAD(month, 2, '0')) AS main_column,
          CONCAT(year, '-', LPAD(month, 2, '0')) AS 'key',
          SUM(CASE WHEN country = 'ARMENIA' THEN in_count ELSE 0 END) AS arm_in,
          SUM(CASE WHEN country = 'ARMENIA' THEN out_count ELSE 0 END) AS arm_out,
          SUM(CASE WHEN country = 'ARMENIA' THEN in_count ELSE 0 END) - SUM(CASE WHEN country = 'ARMENIA' THEN out_count ELSE 0 END) AS arm_net,
          SUM(CASE WHEN country <> 'ARMENIA' THEN in_count ELSE 0 END) AS other_in,
          SUM(CASE WHEN country <> 'ARMENIA' THEN out_count ELSE 0 END) AS other_out,
          SUM(CASE WHEN country <> 'ARMENIA' THEN in_count ELSE 0 END) - SUM(CASE WHEN country <> 'ARMENIA' THEN out_count ELSE 0 END) AS other_net,
          SUM(in_count) AS total_in,
          SUM(out_count) AS total_out,
          SUM(in_count) - SUM(out_count) AS total_net
      FROM 
          crosses
      WHERE 
          year IN (${year})
          AND month = ${month}
      GROUP BY 
          year, month
      ORDER BY 
          year DESC, month DESC;`;
    default:
      throw new Error("Invalid period specified");
  }
};

function quarterlyQueryBuilder(years, quarter) {
  return `SELECT 
  CONCAT(year, ' Q', ${quarter}) AS main_column,
  CONCAT(year, ' Q', ${quarter}) AS 'key',
  SUM(CASE WHEN country = 'ARMENIA' THEN in_count ELSE 0 END) AS arm_in,
  SUM(CASE WHEN country = 'ARMENIA' THEN out_count ELSE 0 END) AS arm_out,
  SUM(CASE WHEN country = 'ARMENIA' THEN in_count ELSE 0 END) - SUM(CASE WHEN country = 'ARMENIA' THEN out_count ELSE 0 END) AS arm_net,
  SUM(CASE WHEN country <> 'ARMENIA' THEN in_count ELSE 0 END) AS other_in,
  SUM(CASE WHEN country <> 'ARMENIA' THEN out_count ELSE 0 END) AS other_out,
  SUM(CASE WHEN country <> 'ARMENIA' THEN in_count ELSE 0 END) - SUM(CASE WHEN country <> 'ARMENIA' THEN out_count ELSE 0 END) AS other_net,
  SUM(in_count) AS total_in,
  SUM(out_count) AS total_out,
  SUM(in_count) - SUM(out_count) AS total_net
FROM 
  crosses
WHERE 
  year IN (${years})
  AND QUARTER(STR_TO_DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-01'), '%Y-%m-%d')) = ${quarter}
GROUP BY 
  year, QUARTER(STR_TO_DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-01'), '%Y-%m-%d'))
ORDER BY 
  year DESC, QUARTER(STR_TO_DATE(CONCAT(year, '-', LPAD(month, 2, '0'), '-01'), '%Y-%m-%d')) DESC;`;
}

function halfyearQueryBuilder(years, half) {
  const halfCondition = half === 1 ? " AND month BETWEEN 1 AND 6" : " AND month BETWEEN 7 AND 12";
  return `SELECT 
  CONCAT(year, ' H', IF(month BETWEEN 1 AND 6, 1, 2)) AS main_column,
  CONCAT(year, ' H', IF(month BETWEEN 1 AND 6, 1, 2)) AS 'key',
  SUM(CASE WHEN country = 'ARMENIA' THEN in_count ELSE 0 END) AS arm_in,
  SUM(CASE WHEN country = 'ARMENIA' THEN out_count ELSE 0 END) AS arm_out,
  SUM(CASE WHEN country = 'ARMENIA' THEN in_count ELSE 0 END) - SUM(CASE WHEN country = 'ARMENIA' THEN out_count ELSE 0 END) AS arm_net,
  SUM(CASE WHEN country <> 'ARMENIA' THEN in_count ELSE 0 END) AS other_in,
  SUM(CASE WHEN country <> 'ARMENIA' THEN out_count ELSE 0 END) AS other_out,
  SUM(CASE WHEN country <> 'ARMENIA' THEN in_count ELSE 0 END) - SUM(CASE WHEN country <> 'ARMENIA' THEN out_count ELSE 0 END) AS other_net,
  SUM(in_count) AS total_in,
  SUM(out_count) AS total_out,
  SUM(in_count) - SUM(out_count) AS total_net
FROM 
  crosses
WHERE 
  year IN (${years}) ${halfCondition}
GROUP BY 
  year,IF(month BETWEEN 1 AND 6, 1, 2),CONCAT(year, ' H', IF(month BETWEEN 1 AND 6, 1, 2))
ORDER BY 
  year DESC, IF(month BETWEEN 1 AND 6, 1, 2) DESC;
`;
}

const formatEaeuEmployeeApplicationsQuery = ({ year, month, period, claim_type ,report_type,decType}) => {
  let period_where_condition = "";
  const claim_type_where_condion = claim_type == "all" ? "" : ` AND a.type = '${claim_type}'`;

  if (period == periodsMap.H1) {
    period_where_condition = `   AND QUARTER(a.created_at) IN (1,2) `;
  } else if (period == periodsMap.H2) {
    period_where_condition = `   AND  QUARTER(a.created_at) IN (3,4)  `;
  } else if (period == periodsMap.ANNUAL) {
    period_where_condition = ` `;
  } else if (period == periodsMap.Q1) {
    period_where_condition = `   AND  QUARTER(a.created_at) =1  `;
  } else if (period == periodsMap.Q2) {
    period_where_condition = `   AND  QUARTER(a.created_at) =2  `;
  } else if (period == periodsMap.Q3) {
    period_where_condition = `   AND  QUARTER(a.created_at) =3  `;
  } else if (period == periodsMap.Q4) {
    period_where_condition = `   AND  QUARTER(a.created_at) =4  `;
  } else if (period == periodsMap["9MONTHLY"]) {
    period_where_condition = `   AND  QUARTER(a.created_at) IN(1,2,3)  `;
  }

  const monthWhereCondition = month ? ` AND month(a.created_at) = '${month}'` : "";

  return `SELECT
      sd.name_am,


      SUM(sd.gender_id = 2 AND sd.age BETWEEN 0 AND 34) AS female_under_34,
      SUM(sd.gender_id = 1 AND sd.age BETWEEN 0 AND 34) AS male_under_34,
      SUM(sd.age BETWEEN 0 AND 34)                      AS total_under_34,

 
      SUM(sd.gender_id = 2 AND sd.age BETWEEN 35 AND 64) AS female_35_64,
      SUM(sd.gender_id = 1 AND sd.age BETWEEN 35 AND 64) AS male_35_64,
      SUM(sd.age BETWEEN 35 AND 64)                      AS total_35_64,

      
      SUM(sd.gender_id = 2 AND sd.age >= 65) AS female_upper_65,
      SUM(sd.gender_id = 1 AND sd.age >= 65) AS male_upper_65,  
      SUM(sd.age >= 65)                      AS total_upper_65,

    
      SUM(sd.gender_id = 2) AS total_female,
      SUM(sd.gender_id = 1) AS total_male,
      COUNT(*) AS grand_total

    FROM (
      
      SELECT
          a.id AS claim_id,
          YEAR(a.created_at) - c.birthday_year AS age,
          e.gender_id,
          d.name_am AS name_am
      FROM claims a
      JOIN eaeu_employees c ON a.eaeu_employee_id = c.id
      JOIN countries  d ON c.citizenship_id = d.id
      JOIN users      e ON c.user_id = e.id
     
      WHERE a.eaeu_employee_id IS NOT NULL
        AND YEAR(a.created_at) = '${year}'
        ${period_where_condition}
        ${monthWhereCondition}
        ${claim_type_where_condion}
      
    ) sd
    GROUP BY sd.name_am
    ORDER BY grand_total DESC`;
};

const formatEaeuEmployeeDecisionsQuery = ({
  year,
  month,
  period,
  claim_type,
  decType,
  report_type,
}) => {
  let period_where_condition = "";
  const claim_type_where_condion = claim_type == "all" ? "" : ` AND a.type = '${claim_type}'`;

  let action = ` AND action IN ('${decType}') `;

  if (period == periodsMap.H1) {
    period_where_condition = `   AND QUARTER(g.created_at) IN (1,2) `;
  } else if (period == periodsMap.H2) {
    period_where_condition = `   AND  QUARTER(g.created_at) IN (3,4)  `;
  } else if (period == periodsMap.ANNUAL) {
    period_where_condition = ` `;
  } else if (period == periodsMap.Q1) {
    period_where_condition = `   AND  QUARTER(g.created_at) =1  `;
  } else if (period == periodsMap.Q2) {
    period_where_condition = `   AND  QUARTER(g.created_at) =2  `;
  } else if (period == periodsMap.Q3) {
    period_where_condition = `   AND  QUARTER(g.created_at) =3  `;
  } else if (period == periodsMap.Q4) {
    period_where_condition = `   AND  QUARTER(g.created_at) =4  `;
  } else if (period == periodsMap["9MONTHLY"]) {
    period_where_condition = `   AND  QUARTER(g.created_at) IN(1,2,3)  `;
  }

  const monthWhereCondition = month ? ` AND month(g.created_at) = ${month}` : "";

  return `SELECT
      sd.name_am,


      SUM(sd.gender_id = 2 AND sd.age BETWEEN 0 AND 34) AS female_under_34,
      SUM(sd.gender_id = 1 AND sd.age BETWEEN 0 AND 34) AS male_under_34,
      SUM(sd.age BETWEEN 0 AND 34)                      AS total_under_34,

 
      SUM(sd.gender_id = 2 AND sd.age BETWEEN 35 AND 64) AS female_35_64,
      SUM(sd.gender_id = 1 AND sd.age BETWEEN 35 AND 64) AS male_35_64,
      SUM(sd.age BETWEEN 35 AND 64)                      AS total_35_64,

      
      SUM(sd.gender_id = 2 AND sd.age >= 65) AS female_upper_65,
      SUM(sd.gender_id = 1 AND sd.age >= 65) AS male_upper_65,  
      SUM(sd.age >= 65)                      AS total_upper_65,

    
      SUM(sd.gender_id = 2) AS total_female,
      SUM(sd.gender_id = 1) AS total_male,
      COUNT(*) AS grand_total

    FROM (
      
      SELECT
          a.id AS claim_id,
          YEAR(g.created_at) - c.birthday_year AS age,
          e.gender_id,
          d.name_am AS name_am
      FROM claims a
      JOIN eaeu_employees  c ON a.eaeu_employee_id = c.id
      JOIN countries  d ON c.citizenship_id = d.id
      JOIN users      e ON c.user_id = e.id
      JOIN (
          SELECT claim_id, MAX(id) AS last_term_id
          FROM ms_logs
          WHERE type = 6 ${action}
          GROUP BY claim_id
      ) lt ON lt.claim_id = a.id
      JOIN ms_logs g ON g.id = lt.last_term_id
      WHERE a.eaeu_employee_id IS NOT NULL
        AND YEAR(g.created_at) = '${year}'
        ${period_where_condition}
        ${monthWhereCondition} 
        ${claim_type_where_condion}
      
    ) sd
    GROUP BY sd.name_am
    ORDER BY grand_total DESC`;
};

const formatEaeuEmployeeFamApplicationsQuery = ({ year, month, period, claim_type ,report_type,decType}) => {
  let period_where_condition = "";
  const claim_type_where_condion = claim_type == "all" ? "" : ` AND a.type = '${claim_type}'`;

  if (period == periodsMap.H1) {
    period_where_condition = `   AND QUARTER(a.created_at) IN (1,2) `;
  } else if (period == periodsMap.H2) {
    period_where_condition = `   AND  QUARTER(a.created_at) IN (3,4)  `;
  } else if (period == periodsMap.ANNUAL) {
    period_where_condition = ` `;
  } else if (period == periodsMap.Q1) {
    period_where_condition = `   AND  QUARTER(a.created_at) =1  `;
  } else if (period == periodsMap.Q2) {
    period_where_condition = `   AND  QUARTER(a.created_at) =2  `;
  } else if (period == periodsMap.Q3) {
    period_where_condition = `   AND  QUARTER(a.created_at) =3  `;
  } else if (period == periodsMap.Q4) {
    period_where_condition = `   AND  QUARTER(a.created_at) =4  `;
  } else if (period == periodsMap["9MONTHLY"]) {
    period_where_condition = `   AND  QUARTER(a.created_at) IN(1,2,3)  `;
  }

  const monthWhereCondition = month ? ` AND month(a.created_at) = '${month}'` : "";

  return `SELECT
      sd.name_am,


      SUM(sd.gender_id = 2 AND sd.age BETWEEN 0 AND 34) AS female_under_34,
      SUM(sd.gender_id = 1 AND sd.age BETWEEN 0 AND 34) AS male_under_34,
      SUM(sd.age BETWEEN 0 AND 34)                      AS total_under_34,

 
      SUM(sd.gender_id = 2 AND sd.age BETWEEN 35 AND 64) AS female_35_64,
      SUM(sd.gender_id = 1 AND sd.age BETWEEN 35 AND 64) AS male_35_64,
      SUM(sd.age BETWEEN 35 AND 64)                      AS total_35_64,

      
      SUM(sd.gender_id = 2 AND sd.age >= 65) AS female_upper_65,
      SUM(sd.gender_id = 1 AND sd.age >= 65) AS male_upper_65,  
      SUM(sd.age >= 65)                      AS total_upper_65,

    
      SUM(sd.gender_id = 2) AS total_female,
      SUM(sd.gender_id = 1) AS total_male,
      COUNT(*) AS grand_total

    FROM (
      
      SELECT
          a.id AS claim_id,
          YEAR(a.created_at) - c.birthday_year AS age,
          c.gender_id,
          d.name_am AS name_am
      FROM claims a
      JOIN eaeu_employee_family_members c ON a.eaeu_employee_family_member_id = c.id
      JOIN countries  d ON c.citizenship_id = d.id
      
     
      WHERE a.eaeu_employee_family_member_id IS NOT NULL
        AND YEAR(a.created_at) = '${year}'
        ${period_where_condition}
        ${monthWhereCondition}
        ${claim_type_where_condion}
      
    ) sd
    GROUP BY sd.name_am
    ORDER BY grand_total DESC`;
};
const formatEaeuEmployeeFamDecisionsQuery = ({
  year,
  month,
  period,
  claim_type,
  decType,
  report_type,
}) => {
  let period_where_condition = "";
  const claim_type_where_condion = claim_type == "all" ? "" : ` AND a.type = '${claim_type}'`;

  let action = ` AND action IN ('${decType}') `;

  if (period == periodsMap.H1) {
    period_where_condition = `   AND QUARTER(g.created_at) IN (1,2) `;
  } else if (period == periodsMap.H2) {
    period_where_condition = `   AND  QUARTER(g.created_at) IN (3,4)  `;
  } else if (period == periodsMap.ANNUAL) {
    period_where_condition = ` `;
  } else if (period == periodsMap.Q1) {
    period_where_condition = `   AND  QUARTER(g.created_at) =1  `;
  } else if (period == periodsMap.Q2) {
    period_where_condition = `   AND  QUARTER(g.created_at) =2  `;
  } else if (period == periodsMap.Q3) {
    period_where_condition = `   AND  QUARTER(g.created_at) =3  `;
  } else if (period == periodsMap.Q4) {
    period_where_condition = `   AND  QUARTER(g.created_at) =4  `;
  } else if (period == periodsMap["9MONTHLY"]) {
    period_where_condition = `   AND  QUARTER(g.created_at) IN(1,2,3)  `;
  }

  const monthWhereCondition = month ? ` AND month(g.created_at) = ${month}` : "";

  return `SELECT
      sd.name_am,


      SUM(sd.gender_id = 2 AND sd.age BETWEEN 0 AND 34) AS female_under_34,
      SUM(sd.gender_id = 1 AND sd.age BETWEEN 0 AND 34) AS male_under_34,
      SUM(sd.age BETWEEN 0 AND 34)                      AS total_under_34,

 
      SUM(sd.gender_id = 2 AND sd.age BETWEEN 35 AND 64) AS female_35_64,
      SUM(sd.gender_id = 1 AND sd.age BETWEEN 35 AND 64) AS male_35_64,
      SUM(sd.age BETWEEN 35 AND 64)                      AS total_35_64,

      
      SUM(sd.gender_id = 2 AND sd.age >= 65) AS female_upper_65,
      SUM(sd.gender_id = 1 AND sd.age >= 65) AS male_upper_65,  
      SUM(sd.age >= 65)                      AS total_upper_65,

    
      SUM(sd.gender_id = 2) AS total_female,
      SUM(sd.gender_id = 1) AS total_male,
      COUNT(*) AS grand_total

    FROM (
      
      SELECT
          a.id AS claim_id,
          YEAR(g.created_at) - c.birthday_year AS age,
          c.gender_id,
          d.name_am AS name_am
      FROM claims a
      JOIN eaeu_employee_family_members  c ON a.eaeu_employee_family_member_id = c.id
      JOIN countries  d ON c.citizenship_id = d.id
      JOIN (
          SELECT claim_id, MAX(id) AS last_term_id
          FROM ms_logs
          WHERE type = 6 ${action}
          GROUP BY claim_id
      ) lt ON lt.claim_id = a.id
      JOIN ms_logs g ON g.id = lt.last_term_id
      WHERE a.eaeu_employee_family_member_id IS NOT NULL
        AND YEAR(g.created_at) = '${year}'
        ${period_where_condition}
        ${monthWhereCondition} 
        ${claim_type_where_condion}
      
    ) sd
    GROUP BY sd.name_am
    ORDER BY grand_total DESC`;
};

const formatWpApplicationsQuery = ({ year, month, period, decType, claim_type, report_type }) => {
  let period_where_condition = "";

  if (period == periodsMap.H1) {
    period_where_condition = `   AND QUARTER(a.created_at) IN (1,2) `;
  } else if (period == periodsMap.H2) {
    period_where_condition = `   AND  QUARTER(a.created_at) IN (3,4)  `;
  } else if (period == periodsMap.ANNUAL) {
    period_where_condition = ` `;
  } else if (period == periodsMap.Q1) {
    period_where_condition = `   AND  QUARTER(a.created_at) =1  `;
  } else if (period == periodsMap.Q2) {
    period_where_condition = `   AND  QUARTER(a.created_at) =2  `;
  } else if (period == periodsMap.Q3) {
    period_where_condition = `   AND  QUARTER(a.created_at) =3  `;
  } else if (period == periodsMap.Q4) {
    period_where_condition = `   AND  QUARTER(a.created_at) =4  `;
  } else if (period == periodsMap["9MONTHLY"]) {
    period_where_condition = `   AND  QUARTER(a.created_at) IN(1,2,3)  `;
  }

  const claim_type_where_condion = claim_type == "all" ? "" : ` AND a.type = '${claim_type}'`;

  const monthWhereCondition = month ? ` AND month(a.creeated_at) = '${month}'` : "";

  return `SELECT
        sd.name_am,

        SUM(sd.gender_id = 2 AND sd.age BETWEEN 0 AND 34) AS female_under_34,
        SUM(sd.gender_id = 1 AND sd.age BETWEEN 0 AND 34) AS male_under_34,
        SUM(sd.age BETWEEN 0 AND 34)                      AS total_under_34,


        SUM(sd.gender_id = 2 AND sd.age BETWEEN 35 AND 64) AS female_35_64,
        SUM(sd.gender_id = 1 AND sd.age BETWEEN 35 AND 64) AS male_35_64,
        SUM(sd.age BETWEEN 35 AND 64)                      AS total_35_64,

 
        SUM(sd.gender_id = 2 AND sd.age >= 65) AS female_upper_65,
        SUM(sd.gender_id = 1 AND sd.age >= 65) AS male_upper_65,  
        SUM(sd.age >= 65)                      AS total_upper_65,

      
        SUM(sd.gender_id = 2) AS total_female,
        SUM(sd.gender_id = 1) AS total_male,
        COUNT(*) AS grand_total

      FROM (
        SELECT
            a.id AS claim_id,
            YEAR(a.created_at) - c.birthday_year AS age,
            e.gender_id,
            d.name_am AS name_am,
            a.type AS claim_type
        FROM claims a
        JOIN vacancies  b ON a.vacancy_id = b.id
        JOIN employees  c ON a.employee_id = c.id
        JOIN countries  d ON c.citizenship_id = d.id
        JOIN users      e ON c.user_id = e.id
        WHERE a.employee_id IS NOT NULL
          AND YEAR(a.created_at) = '${year}'
          ${period_where_condition}
          ${monthWhereCondition}
          AND b.type IN (1,2)
        ${claim_type_where_condion}
        UNION

        SELECT
            a.id AS claim_id,
            YEAR(a.created_at) - c.birthday_year AS age,
            e.gender_id,
            d.name_am AS name_am,
            a.type AS claim_type
        FROM claims a
        JOIN employees c ON a.employee_id = c.id
        JOIN countries d ON c.citizenship_id = d.id
        JOIN users     e ON c.user_id = e.id
        WHERE a.employee_id IS NOT NULL
          AND YEAR(a.created_at) = '${year}'
          ${period_where_condition}
          ${monthWhereCondition}
          AND a.in_progress_vacancy_id IS NOT NULL
        ${claim_type_where_condion}
      ) sd
      GROUP BY sd.name_am
      ORDER BY grand_total DESC`;
};

const formatWpDecisionsQuery = ({ year, month, period, decType, claim_type ,report_type}) => {
  let period_where_condition = "";

  let action = ` AND action IN ('${decType}') `;

  if (period == periodsMap.H1) {
    period_where_condition = `   AND QUARTER(g.created_at) IN (1,2) `;
  } else if (period == periodsMap.H2) {
    period_where_condition = `   AND  QUARTER(g.created_at) IN (3,4)  `;
  } else if (period == periodsMap.ANNUAL) {
    period_where_condition = ` `;
  } else if (period == periodsMap.Q1) {
    period_where_condition = `   AND  QUARTER(g.created_at) =1  `;
  } else if (period == periodsMap.Q2) {
    period_where_condition = `   AND  QUARTER(g.created_at) =2  `;
  } else if (period == periodsMap.Q3) {
    period_where_condition = `   AND  QUARTER(g.created_at) =3  `;
  } else if (period == periodsMap.Q4) {
    period_where_condition = `   AND  QUARTER(g.created_at) =4  `;
  } else if (period == periodsMap["9MONTHLY"]) {
    period_where_condition = `   AND  QUARTER(g.created_at) IN(1,2,3)  `;
  }

  const claim_type_where_condion = claim_type == "all" ? "" : ` AND a.type = '${claim_type}'`;

  const monthWhereCondition = month ? ` AND month(g.created_at) = '${month}'` : "";

  return `SELECT
      sd.name_am,


      SUM(sd.gender_id = 2 AND sd.age BETWEEN 0 AND 34) AS female_under_34,
      SUM(sd.gender_id = 1 AND sd.age BETWEEN 0 AND 34) AS male_under_34,
      SUM(sd.age BETWEEN 0 AND 34)                      AS total_under_34,

 
      SUM(sd.gender_id = 2 AND sd.age BETWEEN 35 AND 64) AS female_35_64,
      SUM(sd.gender_id = 1 AND sd.age BETWEEN 35 AND 64) AS male_35_64,
      SUM(sd.age BETWEEN 35 AND 64)                      AS total_35_64,

      
      SUM(sd.gender_id = 2 AND sd.age >= 65) AS female_upper_65,
      SUM(sd.gender_id = 1 AND sd.age >= 65) AS male_upper_65,  
      SUM(sd.age >= 65)                      AS total_upper_65,

    
      SUM(sd.gender_id = 2) AS total_female,
      SUM(sd.gender_id = 1) AS total_male,
      COUNT(*) AS grand_total

    FROM (
      
      SELECT
          a.id AS claim_id,
          YEAR(g.created_at) - c.birthday_year AS age,
          e.gender_id,
          d.name_am AS name_am
      FROM claims a
      JOIN vacancies  b ON a.vacancy_id = b.id
      JOIN employees  c ON a.employee_id = c.id
      JOIN countries  d ON c.citizenship_id = d.id
      JOIN users      e ON c.user_id = e.id
      JOIN (
          SELECT claim_id, MAX(id) AS last_term_id
          FROM ms_logs
          WHERE type = 6 ${action}
          GROUP BY claim_id
      ) lt ON lt.claim_id = a.id
      JOIN ms_logs g ON g.id = lt.last_term_id
      WHERE a.employee_id IS NOT NULL
        AND YEAR(g.created_at) = '${year}'
        ${period_where_condition}
        ${monthWhereCondition}
        AND b.type IN (1,2)
        ${claim_type_where_condion}
      UNION

      
      SELECT
          a.id AS claim_id,
          YEAR(g.created_at) - c.birthday_year AS age,
          e.gender_id,
          d.name_am AS name_am
      FROM claims a
      JOIN employees  c ON a.employee_id = c.id
      JOIN countries  d ON c.citizenship_id = d.id
      JOIN users      e ON c.user_id = e.id
      JOIN (
          SELECT claim_id, MAX(id) AS last_term_id
          FROM ms_logs
          WHERE type = 6 ${action}
          GROUP BY claim_id
      ) lt ON lt.claim_id = a.id
      JOIN ms_logs g ON g.id = lt.last_term_id
      WHERE a.employee_id IS NOT NULL
        AND YEAR(g.created_at) = '${year}'
        ${period_where_condition}
        ${monthWhereCondition}
        AND a.in_progress_vacancy_id IS NOT NULL
        ${claim_type_where_condion}
    ) sd
    GROUP BY sd.name_am
    ORDER BY grand_total DESC`;
};

const formatVolunteerApplicationsQuery = ({ year, month, period, claim_type ,report_type,decType}) => {
  let period_where_condition = "";

  const claim_type_where_condion = claim_type == "all" ? "" : ` AND a.type = '${claim_type}'`;

  if (period == periodsMap.H1) {
    period_where_condition = `   AND QUARTER(a.created_at) IN (1,2) `;
  } else if (period == periodsMap.H2) {
    period_where_condition = `   AND  QUARTER(a.created_at) IN (3,4)  `;
  } else if (period == periodsMap.ANNUAL) {
    period_where_condition = ` `;
  } else if (period == periodsMap.Q1) {
    period_where_condition = `   AND  QUARTER(a.created_at) =1  `;
  } else if (period == periodsMap.Q2) {
    period_where_condition = `   AND  QUARTER(a.created_at) =2  `;
  } else if (period == periodsMap.Q3) {
    period_where_condition = `   AND  QUARTER(a.created_at) =3  `;
  } else if (period == periodsMap.Q4) {
    period_where_condition = `   AND  QUARTER(a.created_at) =4  `;
  } else if (period == periodsMap["9MONTHLY"]) {
    period_where_condition = `   AND  QUARTER(a.created_at) IN(1,2,3)  `;
  }

  const monthWhereCondition = month ? ` AND month(a.created_at) = ${month}` : "";

  return `SELECT
      sd.name_am,

      SUM(CASE WHEN sd.gender_id = 2 AND sd.age BETWEEN 0 AND 34 THEN 1 ELSE 0 END) AS female_under_34,
      SUM(CASE WHEN sd.gender_id = 1 AND sd.age BETWEEN 0 AND 34 THEN 1 ELSE 0 END) AS male_under_34,
      SUM(CASE WHEN sd.age BETWEEN 0 AND 34 THEN 1 ELSE 0 END)                      AS total_under_34,

      SUM(CASE WHEN sd.gender_id = 2 AND sd.age BETWEEN 35 AND 64 THEN 1 ELSE 0 END) AS female_35_64,
      SUM(CASE WHEN sd.gender_id = 1 AND sd.age BETWEEN 35 AND 64 THEN 1 ELSE 0 END) AS male_35_64,
      SUM(CASE WHEN sd.age BETWEEN 35 AND 64 THEN 1 ELSE 0 END)                      AS total_35_64,

      SUM(CASE WHEN sd.gender_id = 2 AND sd.age >= 65 THEN 1 ELSE 0 END) AS female_upper_65,
      SUM(CASE WHEN sd.gender_id = 1 AND sd.age >= 65 THEN 1 ELSE 0 END) AS male_upper_65,
      SUM(CASE WHEN sd.age >= 65 THEN 1 ELSE 0 END)                      AS total_upper_65,

      SUM(CASE WHEN sd.gender_id = 2 THEN 1 ELSE 0 END) AS total_female,
      SUM(CASE WHEN sd.gender_id = 1 THEN 1 ELSE 0 END) AS total_male,
      COUNT(*) AS grand_total


    FROM (
      
      SELECT
          a.id AS claim_id,
          YEAR(a.created_at) - c.birthday_year AS age,
          e.gender_id,
          d.name_am AS name_am
      FROM claims a
      JOIN vacancies  b ON a.vacancy_id = b.id
      JOIN employees  c ON a.employee_id = c.id
      JOIN countries  d ON c.citizenship_id = d.id
      JOIN users      e ON c.user_id = e.id
     
      WHERE a.employee_id IS NOT NULL
        AND YEAR(a.created_at) = '${year}'
        ${period_where_condition}
        ${monthWhereCondition}
        AND b.type = 3 
        ${claim_type_where_condion}
      
    ) sd
    GROUP BY sd.name_am
    ORDER BY grand_total DESC`;
};

const formatVolunteerDecisionsQuery = ({ year, month, period, claim_type, decType ,report_type}) => {
  let period_where_condition = "";

  const claim_type_where_condion = claim_type == "all" ? "" : ` AND a.type = '${claim_type}'`;

  let action = ` AND action IN ('${decType}') `;

  if (period == periodsMap.H1) {
    period_where_condition = `   AND QUARTER(g.created_at) IN (1,2) `;
  } else if (period == periodsMap.H2) {
    period_where_condition = `   AND  QUARTER(g.created_at) IN (3,4)  `;
  } else if (period == periodsMap.ANNUAL) {
    period_where_condition = ` `;
  } else if (period == periodsMap.Q1) {
    period_where_condition = `   AND  QUARTER(g.created_at) =1  `;
  } else if (period == periodsMap.Q2) {
    period_where_condition = `   AND  QUARTER(g.created_at) =2  `;
  } else if (period == periodsMap.Q3) {
    period_where_condition = `   AND  QUARTER(g.created_at) =3  `;
  } else if (period == periodsMap.Q4) {
    period_where_condition = `   AND  QUARTER(g.created_at) =4  `;
  } else if (period == periodsMap["9MONTHLY"]) {
    period_where_condition = `   AND  QUARTER(g.created_at) IN(1,2,3)  `;
  }

  const monthWhereCondition = month ? ` AND month(g.created_at) = ${month}` : "";

  return `SELECT
      sd.name_am,


      SUM(sd.gender_id = 2 AND sd.age BETWEEN 0 AND 34) AS female_under_34,
      SUM(sd.gender_id = 1 AND sd.age BETWEEN 0 AND 34) AS male_under_34,
      SUM(sd.age BETWEEN 0 AND 34)                      AS total_under_34,

 
      SUM(sd.gender_id = 2 AND sd.age BETWEEN 35 AND 64) AS female_35_64,
      SUM(sd.gender_id = 1 AND sd.age BETWEEN 35 AND 64) AS male_35_64,
      SUM(sd.age BETWEEN 35 AND 64)                      AS total_35_64,

      
      SUM(sd.gender_id = 2 AND sd.age >= 65) AS female_upper_65,
      SUM(sd.gender_id = 1 AND sd.age >= 65) AS male_upper_65,  
      SUM(sd.age >= 65)                      AS total_upper_65,

    
      SUM(sd.gender_id = 2) AS total_female,
      SUM(sd.gender_id = 1) AS total_male,
      COUNT(*) AS grand_total

    FROM (
      
      SELECT
          a.id AS claim_id,
          YEAR(g.created_at) - c.birthday_year AS age,
          e.gender_id,
          d.name_am AS name_am
      FROM claims a
      JOIN vacancies  b ON a.vacancy_id = b.id
      JOIN employees  c ON a.employee_id = c.id
      JOIN countries  d ON c.citizenship_id = d.id
      JOIN users      e ON c.user_id = e.id
      JOIN (
          SELECT claim_id, MAX(id) AS last_term_id
          FROM ms_logs
          WHERE type = 6 ${action}
          GROUP BY claim_id
      ) lt ON lt.claim_id = a.id
      JOIN ms_logs g ON g.id = lt.last_term_id
      WHERE a.employee_id IS NOT NULL
        AND YEAR(g.created_at) = '${year}'
        ${period_where_condition}
        ${monthWhereCondition}
        AND b.type = 3 
        ${claim_type_where_condion}
      
    ) sd
    GROUP BY sd.name_am
    ORDER BY grand_total DESC`;
};

const formatEaeuOfficialQuery = ({ year, period, claim_type, report_type, decType }) => {
  // claim_type  may be 'total' || 'status_claim' || 'extension'
  // action  may be 'allow' || 'reject' || 'cease' || 'terminate' || 'terminate_citizen'
  let period_in_where_condition = "";
  let action = "";
  const claim_type_where_condion =
    claim_type == "all" ? "" : ` AND stat_data.claim_type = '${claim_type}'`;

  if (report_type == 1) {
    period_in_where_condition = "stat_data.claim_date";
    action = "";
  } else {
    period_in_where_condition = "stat_data.log_date";
    action = ` AND stat_data.action = '${decType}' `;
  }

  let monthWhereCondition = "";
  if (period == periodsMap.H1) {
    monthWhereCondition = ` AND QUARTER(${period_in_where_condition}) IN (1,2) `;
  } else if (period == periodsMap.H2) {
    monthWhereCondition = ` AND QUARTER(${period_in_where_condition}) IN (3,4) `;
  }

  return `SELECT 
  stat_data.name_en, 
  stat_data.name_am, 
  stat_data.name_ru, 

  count(stat_data.id) as grand_total,
  count(if(stat_data.gender_id = 1, stat_data.id, null)) as total_male,
  count(if(stat_data.gender_id = 2, stat_data.id, null)) as total_female,
  
  count(if(stat_data.age < 16, stat_data.id, null)) as total_under_16,
  count(if(stat_data.gender_id = 1 and stat_data.age < 16, stat_data.id, null)) as male_under_16,
  count(if(stat_data.gender_id = 2 and stat_data.age < 16, stat_data.id, null)) as female_under_16,
  
  count(if(stat_data.age >= 16 and stat_data.age < 20, stat_data.id, null)) as total_16_19,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 16 and stat_data.age < 20, stat_data.id, null)) as male_16_19,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 16 and stat_data.age < 20, stat_data.id, null)) as female_16_19,

  count(if(stat_data.age >= 20 and stat_data.age < 25, stat_data.id, null)) as total_20_24,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 20 and stat_data.age < 25, stat_data.id, null)) as male_20_24,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 20 and stat_data.age < 25, stat_data.id, null)) as female_20_24,

  count(if(stat_data.age >= 25 and stat_data.age < 30, stat_data.id, null)) as total_25_29,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 25 and stat_data.age < 30, stat_data.id, null)) as male_25_29,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 25 and stat_data.age < 30, stat_data.id, null)) as female_25_29,

  count(if(stat_data.age >= 30 and stat_data.age < 35, stat_data.id, null)) as total_30_34,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 30 and stat_data.age < 35, stat_data.id, null)) as male_30_34,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 30 and stat_data.age < 35, stat_data.id, null)) as female_30_34,

  count(if(stat_data.age >= 35 and stat_data.age < 40, stat_data.id, null)) as total_35_39,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 35 and stat_data.age < 40, stat_data.id, null)) as male_35_39,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 35 and stat_data.age < 40, stat_data.id, null)) as female_35_39,

  count(if(stat_data.age >= 40 and stat_data.age < 45, stat_data.id, null)) as total_40_44,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 40 and stat_data.age < 45, stat_data.id, null)) as male_40_44,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 40 and stat_data.age < 45, stat_data.id, null)) as female_40_44,

  count(if(stat_data.age >= 45 and stat_data.age < 50, stat_data.id, null)) as total_45_49,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 45 and stat_data.age < 50, stat_data.id, null)) as male_45_49,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 45 and stat_data.age < 50, stat_data.id, null)) as female_45_49,

  count(if(stat_data.age >= 50 and stat_data.age < 55, stat_data.id, null)) as total_50_54,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 50 and stat_data.age < 55, stat_data.id, null)) as male_50_54,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 50 and stat_data.age < 55, stat_data.id, null)) as female_50_54,

  count(if(stat_data.age >= 55 and stat_data.age < 60, stat_data.id, null)) as total_55_59,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 55 and stat_data.age < 60, stat_data.id, null)) as male_55_59,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 55 and stat_data.age < 60, stat_data.id, null)) as female_55_59,
  
  count(if(stat_data.age >= 60 and stat_data.age < 65, stat_data.id, null)) as total_60_64,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 60 and stat_data.age < 65, stat_data.id, null)) as male_60_64,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 60 and stat_data.age < 65, stat_data.id, null)) as female_60_64,
  
  count(if(stat_data.age >= 65, stat_data.id, null)) as total_upper_65,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 65, stat_data.id, null)) as male_upper_65,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 65, stat_data.id, null)) as female_upper_65

  from
  (
  SELECT a.id, 
  a.created_at as claim_date, 
  a.type as claim_type, 
  b.citizenship_id, 
  c.gender_id, 
  d.name_am, 
  d.name_en, 
  d.name_ru, 
  b.birthday_year, 
  year(a.created_at) - b.birthday_year as age, 
  g.action, 
  g.log_date 
  FROM claims a 
  inner join eaeu_employees b on a.eaeu_employee_id = b.id
  inner join users c on b.user_id = c.id
  inner join countries d on b.citizenship_id = d.id 
  left join 
  (select f.claim_id, f.action, 
    date(f.created_at) as log_date from ms_logs f 
    where f.id = (SELECT MAX(t4.id) from ms_logs t4 where f.claim_id = t4.claim_id) and f.type = 6) as g 
    ON a.id = g.claim_id
  ) as stat_data
  where 
  year(${period_in_where_condition}) = '${year}' 
   ${claim_type_where_condion}
   ${monthWhereCondition}
   ${action}
  group by stat_data.citizenship_id`;
};

const formatEaeuEmployeeFamOfficialQuery = ({
  year,
  month,
  period,
  claim_type,
  report_type,
  decType,
}) => {
  let period_in_where_condition = "";
  let action = "";

  if (report_type == 1) {
    period_in_where_condition = "stat_data.claim_date";
  } else {
    period_in_where_condition = "stat_data.log_date";
    action = ` AND stat_data.action = '${decType}' `;
  }

  const claim_type_where_condion =
    claim_type == "all" ? "" : ` AND stat_data.claim_type = '${claim_type}'`;

  let monthWhereCondition = "";
  if (period == periodsMap.H1) {
    monthWhereCondition = ` AND QUARTER(${period_in_where_condition}) IN (1,2) `;
    ` AND month() = '${month}'`;
  } else if (period == periodsMap.H2) {
    monthWhereCondition = ` AND QUARTER(${period_in_where_condition}) IN (3,4) `;
  }

  return `SELECT 
  stat_data.name_en, 
  stat_data.name_am, 
  stat_data.name_ru, 
  count(stat_data.id) as grand_total,
  count(if(stat_data.gender_id = 1, stat_data.id, null)) as total_male,
  count(if(stat_data.gender_id = 2, stat_data.id, null)) as total_female,
  
  count(if(stat_data.age < 16, stat_data.id, null)) as total_under_16,
  count(if(stat_data.gender_id = 1 and stat_data.age < 16, stat_data.id, null)) as male_under_16,
  count(if(stat_data.gender_id = 2 and stat_data.age < 16, stat_data.id, null)) as female_under_16,
  
  count(if(stat_data.age >= 16 and stat_data.age < 20, stat_data.id, null)) as total_16_19,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 16 and stat_data.age < 20, stat_data.id, null)) as male_16_19,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 16 and stat_data.age < 20, stat_data.id, null)) as female_16_19,

  count(if(stat_data.age >= 20 and stat_data.age < 25, stat_data.id, null)) as total_20_24,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 20 and stat_data.age < 25, stat_data.id, null)) as male_20_24,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 20 and stat_data.age < 25, stat_data.id, null)) as female_20_24,

  count(if(stat_data.age >= 25 and stat_data.age < 30, stat_data.id, null)) as total_25_29,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 25 and stat_data.age < 30, stat_data.id, null)) as male_25_29,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 25 and stat_data.age < 30, stat_data.id, null)) as female_25_29,

  count(if(stat_data.age >= 30 and stat_data.age < 35, stat_data.id, null)) as total_30_34,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 30 and stat_data.age < 35, stat_data.id, null)) as male_30_34,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 30 and stat_data.age < 35, stat_data.id, null)) as female_30_34,

  count(if(stat_data.age >= 35 and stat_data.age < 40, stat_data.id, null)) as total_35_39,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 35 and stat_data.age < 40, stat_data.id, null)) as male_35_39,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 35 and stat_data.age < 40, stat_data.id, null)) as female_35_39,

  count(if(stat_data.age >= 40 and stat_data.age < 45, stat_data.id, null)) as total_40_44,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 40 and stat_data.age < 45, stat_data.id, null)) as male_40_44,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 40 and stat_data.age < 45, stat_data.id, null)) as female_40_44,

  count(if(stat_data.age >= 45 and stat_data.age < 50, stat_data.id, null)) as total_45_49,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 45 and stat_data.age < 50, stat_data.id, null)) as male_45_49,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 45 and stat_data.age < 50, stat_data.id, null)) as female_45_49,

  count(if(stat_data.age >= 50 and stat_data.age < 55, stat_data.id, null)) as total_50_54,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 50 and stat_data.age < 55, stat_data.id, null)) as male_50_54,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 50 and stat_data.age < 55, stat_data.id, null)) as female_50_54,

  count(if(stat_data.age >= 55 and stat_data.age < 60, stat_data.id, null)) as total_55_59,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 55 and stat_data.age < 60, stat_data.id, null)) as male_55_59,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 55 and stat_data.age < 60, stat_data.id, null)) as female_55_59,
  
  count(if(stat_data.age >= 60 and stat_data.age < 65, stat_data.id, null)) as total_60_64,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 60 and stat_data.age < 65, stat_data.id, null)) as male_60_64,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 60 and stat_data.age < 65, stat_data.id, null)) as female_60_64,
  
  count(if(stat_data.age >= 65, stat_data.id, null)) as total_upper_65,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 65, stat_data.id, null)) as male_upper_65,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 65, stat_data.id, null)) as female_upper_65
  from
  (
  SELECT a.id,
  a.created_at as claim_date, 
  a.type as claim_type, 
  b.citizenship_id, 
  b.gender_id, 
  d.name_am, 
  d.name_en, 
  d.name_ru, 
  b.birthday_year, 
  year(a.created_at) - b.birthday_year as age, 
  g.action, 
  g.log_date 
  FROM claims a 
  inner join eaeu_employee_family_members b on a.eaeu_employee_family_member_id = b.id
  inner join countries d on b.citizenship_id = d.id 
  left join 
  (select 
    f.claim_id, 
    f.action, 
    date(f.created_at) as log_date from ms_logs f where f.id = (SELECT MAX(t4.id) from ms_logs t4 where f.claim_id = t4.claim_id) and f.type = 6) as g ON a.id = g.claim_id)
   as stat_data
  where  
   year(${period_in_where_condition}) = '${year}'
   ${claim_type_where_condion} 
   ${monthWhereCondition}
   ${action}
  group by stat_data.citizenship_id,
  stat_data.name_en, 
  stat_data.name_am, 
  stat_data.name_ru`;
};

const formatWpOfficialQuery = ({ year, month, period, claim_type, report_type, decType }) => {
  let period_in_where_condition = "";
  let action = "";

  if (report_type == 1) {
    period_in_where_condition = "stat_data.claim_date";
  } else {
    period_in_where_condition = "stat_data.log_date";
    action = ` AND stat_data.action = '${decType}' `;
  }

  const claim_type_where_condion =
    claim_type == "all" ? "" : ` AND stat_data.claim_type = '${claim_type}'`;

  let monthWhereCondition = "";
  if (period == periodsMap.H1) {
    monthWhereCondition = ` AND QUARTER(${period_in_where_condition}) IN (1,2) `;
    ` AND month() = '${month}'`;
  } else if (period == periodsMap.H2) {
    monthWhereCondition = ` AND QUARTER(${period_in_where_condition}) IN (3,4) `;
  }

  return `SELECT stat_data.name_en, stat_data.name_am, stat_data.name_ru, 
  count(stat_data.id) as grand_total,
  count(if(stat_data.gender_id = 1, stat_data.id, null)) as total_male,
  count(if(stat_data.gender_id = 2, stat_data.id, null)) as total_female,
  
  count(if(stat_data.age < 16, stat_data.id, null)) as total_under_16,
  count(if(stat_data.gender_id = 1 and stat_data.age < 16, stat_data.id, null)) as male_under_16,
  count(if(stat_data.gender_id = 2 and stat_data.age < 16, stat_data.id, null)) as female_under_16,
  
  count(if(stat_data.age >= 16 and stat_data.age < 20, stat_data.id, null)) as total_16_19,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 16 and stat_data.age < 20, stat_data.id, null)) as male_16_19,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 16 and stat_data.age < 20, stat_data.id, null)) as female_16_19,

  count(if(stat_data.age >= 20 and stat_data.age < 25, stat_data.id, null)) as total_20_24,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 20 and stat_data.age < 25, stat_data.id, null)) as male_20_24,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 20 and stat_data.age < 25, stat_data.id, null)) as female_20_24,

  count(if(stat_data.age >= 25 and stat_data.age < 30, stat_data.id, null)) as total_25_29,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 25 and stat_data.age < 30, stat_data.id, null)) as male_25_29,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 25 and stat_data.age < 30, stat_data.id, null)) as female_25_29,

  count(if(stat_data.age >= 30 and stat_data.age < 35, stat_data.id, null)) as total_30_34,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 30 and stat_data.age < 35, stat_data.id, null)) as male_30_34,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 30 and stat_data.age < 35, stat_data.id, null)) as female_30_34,

  count(if(stat_data.age >= 35 and stat_data.age < 40, stat_data.id, null)) as total_35_39,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 35 and stat_data.age < 40, stat_data.id, null)) as male_35_39,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 35 and stat_data.age < 40, stat_data.id, null)) as female_35_39,

  count(if(stat_data.age >= 40 and stat_data.age < 45, stat_data.id, null)) as total_40_44,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 40 and stat_data.age < 45, stat_data.id, null)) as male_40_44,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 40 and stat_data.age < 45, stat_data.id, null)) as female_40_44,

  count(if(stat_data.age >= 45 and stat_data.age < 50, stat_data.id, null)) as total_45_49,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 45 and stat_data.age < 50, stat_data.id, null)) as male_45_49,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 45 and stat_data.age < 50, stat_data.id, null)) as female_45_49,

  count(if(stat_data.age >= 50 and stat_data.age < 55, stat_data.id, null)) as total_50_54,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 50 and stat_data.age < 55, stat_data.id, null)) as male_50_54,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 50 and stat_data.age < 55, stat_data.id, null)) as female_50_54,

  count(if(stat_data.age >= 55 and stat_data.age < 60, stat_data.id, null)) as total_55_59,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 55 and stat_data.age < 60, stat_data.id, null)) as male_55_59,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 55 and stat_data.age < 60, stat_data.id, null)) as female_55_59,
  
  count(if(stat_data.age >= 60 and stat_data.age < 65, stat_data.id, null)) as total_60_64,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 60 and stat_data.age < 65, stat_data.id, null)) as male_60_64,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 60 and stat_data.age < 65, stat_data.id, null)) as female_60_64,
  
  count(if(stat_data.age >= 65, stat_data.id, null)) as total_upper_65,
  count(if(stat_data.gender_id = 1 and stat_data.age >= 65, stat_data.id, null)) as male_upper_65,
  count(if(stat_data.gender_id = 2 and stat_data.age >= 65, stat_data.id, null)) as female_upper_65
  from
  (
  SELECT a.id, a.created_at as claim_date, a.type as claim_type, b.citizenship_id, c.gender_id, d.name_am, d.name_en, d.name_ru, b.birthday_year, year(a.created_at) - b.birthday_year as age, g.action, g.log_date 
  FROM claims a 
  inner join employees b on a.employee_id = b.id
  inner join users c on b.user_id = c.id
  inner join countries d on b.citizenship_id = d.id 
  left join 
  (select f.claim_id, f.action, date(f.created_at) as log_date from ms_logs f where f.id = (SELECT MAX(t4.id) from ms_logs t4 where f.claim_id = t4.claim_id) and f.type = 6) as g ON a.id = g.claim_id) as stat_data
  where   
   year(${period_in_where_condition}) = '${year}' 
   ${claim_type_where_condion}
   ${monthWhereCondition}
   ${action}
  group by stat_data.citizenship_id`;
};

const mapWpData = (data) => {
  const ageGenderCombinations = [
    { label: "Ընդամենը  16-19 տարեկան", field: "total_16_19" },
    { label: "Արական", field: "male_16_19" },
    { label: "Իգական", field: "female_16_19" },
    { label: "Ընդամենը  20-24 տարեկան", field: "total_20_24" },
    { label: "Արական", field: "male_20_24" },
    { label: "Իգական", field: "female_20_24" },
    { label: "Ընդամենը  25-29 տարեկան", field: "total_25_29" },
    { label: "Արական", field: "male_25_29" },
    { label: "Իգական", field: "female_25_29" },
    { label: "Ընդամենը  30-34 տարեկան", field: "total_30_34" },
    { label: "Արական", field: "male_30_34" },
    { label: "Իգական", field: "female_30_34" },
    { label: "Ընդամենը  35-39 տարեկան", field: "total_35_39" },
    { label: "Արական", field: "male_35_39" },
    { label: "Իգական", field: "female_35_39" },
    { label: "Ընդամենը 40-44 տարեկան", field: "total_40_44" },
    { label: "Արական", field: "male_40_44" },
    { label: "Իգական", field: "female_40_44" },
    { label: "Ընդամենը 45-49 տարեկան", field: "total_45_49" },
    { label: "Արական", field: "male_45_49" },
    { label: "Իգական", field: "female_45_49" },
    { label: "Ընդամենը 50-54 տարեկան", field: "total_50_54" },
    { label: "Արական", field: "male_50_54" },
    { label: "Իգական", field: "female_50_54" },
    { label: "Ընդամենը 55-59 տարեկան", field: "total_55_59" },
    { label: "Արական", field: "male_55_59" },
    { label: "Իգական", field: "female_55_59" },
    { label: "Ընդամենը 60-64 տարեկան", field: "total_60_64" },
    { label: "Արական", field: "male_60_64" },
    { label: "Իգական", field: "female_60_64" },
    { label: "Ընդամենը 65+ տարեկան", field: "total_upper_65" },
    { label: "Արական", field: "male_upper_65" },
    { label: "Իգական", field: "female_upper_65" },
  ];

  const arrayOfObjects = ageGenderCombinations.map((combination) => {
    const rowData = data.reduce((acc, country) => {
      acc[country.name_en] = country[combination.field];
      return acc;
    }, {} as Record<string, any>);

    // Calculate the total of the row
    const total = (Object.values(rowData) as Array<number>).reduce(
      (sum, value) => sum + Number(value || 0),
      0,
    );
    rowData.total = total;

    return {
      ageGender: combination.label,
      ...rowData,
    };
  });

  return arrayOfObjects;
};

const mapEaeuFamData = (data) => {
  const ageGenderCombinations = [
    { label: "Ընդամենը  0-15 տարեկան", field: "total_under_16" },
    { label: "Արական", field: "male_under_16" },
    { label: "Իգական", field: "female_under_16" },
    { label: "Ընդամենը  16-19 տարեկան", field: "total_16_19" },
    { label: "Արական", field: "male_16_19" },
    { label: "Իգական", field: "female_16_19" },
    { label: "Ընդամենը  20-24 տարեկան", field: "total_20_24" },
    { label: "Արական", field: "male_20_24" },
    { label: "Իգական", field: "female_20_24" },
    { label: "Ընդամենը  25-29 տարեկան", field: "total_25_29" },
    { label: "Արական", field: "male_25_29" },
    { label: "Իգական", field: "female_25_29" },
    { label: "Ընդամենը  30-34 տարեկան", field: "total_30_34" },
    { label: "Արական", field: "male_30_34" },
    { label: "Իգական", field: "female_30_34" },
    { label: "Ընդամենը  35-39 տարեկան", field: "total_35_39" },
    { label: "Արական", field: "male_35_39" },
    { label: "Իգական", field: "female_35_39" },
    { label: "Ընդամենը 40-44 տարեկան", field: "total_40_44" },
    { label: "Արական", field: "male_40_44" },
    { label: "Իգական", field: "female_40_44" },
    { label: "Ընդամենը 45-49 տարեկան", field: "total_45_49" },
    { label: "Արական", field: "male_45_49" },
    { label: "Իգական", field: "female_45_49" },
    { label: "Ընդամենը 50-54 տարեկան", field: "total_50_54" },
    { label: "Արական", field: "male_50_54" },
    { label: "Իգական", field: "female_50_54" },
    { label: "Ընդամենը 55-59 տարեկան", field: "total_55_59" },
    { label: "Արական", field: "male_55_59" },
    { label: "Իգական", field: "female_55_59" },
    { label: "Ընդամենը 60-64 տարեկան", field: "total_60_64" },
    { label: "Արական", field: "male_60_64" },
    { label: "Իգական", field: "female_60_64" },
    { label: "Ընդամենը 65+ տարեկան", field: "total_upper_65" },
    { label: "Արական", field: "male_upper_65" },
    { label: "Իգական", field: "female_upper_65" },
  ];

  const arrayOfObjects = ageGenderCombinations.map((combination) => {
    const rowData = data.reduce((acc, country) => {
      acc[country.name_am] = country[combination.field];
      return acc;
    }, {} as Record<string, any>);

    // Calculate the total of the row
    const total = (Object.values(rowData) as Array<number>).reduce(
      (sum, value) => sum + Number(value || 0),
      0,
    );
    rowData.total = total;

    return {
      ageGender: combination.label,
      ...rowData,
    };
  });

  return { arrayOfObjects, countries: data.map((country) => country.name_am) };
};

const formatStatisticsPeriodsQuery = (statisticsType) => {
  switch (statisticsType) {
    case "asylum":
      return "SELECT DISTINCT YEAR(mul_date) AS Year FROM tb_case ORDER BY Year DESC";
    case "wp":
      return "SELECT DISTINCT YEAR(created_at) AS Year FROM ms_logs ORDER BY Year DESC";
    case "sahmanahatum":
      return "SELECT DISTINCT year AS Year FROM crosses ORDER BY Year DESC";
    default:
      return "";
  }
};

const formatPeriodLabel = (period, month) => {
  const monthLabel = MOCK_MONTHS[month] ? `${MOCK_MONTHS[month]} ամսում` : "";
  const PERIOD_LABEL_MAPS = {
    h1: "1-ին կիսամյակում",
    h2: "2-րդ կիսամյակում",
    q1: "1-ին եռամսյակում",
    q2: "2-րդ եռամսյակում",
    q3: "3-րդ եռամսյակում",
    q4: "4-րդ եռամսյակում",
    "9monthly": "9-ամսյակում",
    monthly: monthLabel,
  };

  return PERIOD_LABEL_MAPS[period] || "";
};

const formatDecisionLabel = (decisionType) => {
  if (!decisionType) return "";

  const DECISION_TYPE_LABELS_MAP = {
    1: " բավարարման որոշումների վիճակագրությունը ",
    2: " մերժման որոշումների վիճակագրությունը ",
    3: " կարճման որոշումների վիճակագրությունը ",
  };

  return DECISION_TYPE_LABELS_MAP[decisionType] || "";
};

function buildStatExcelTitle(filters, statPageName) {
  if (filters?.statisticsType === "wpSimple") {
    return formatWpSimpleExcelTitle(filters, statPageName);
  }

  if (BORDER_CROSS_STAT_PAGES_BASE_TITLES_MAP[statPageName]) {
    return formatBorderCrossExcelTitle(filters, statPageName);
  }

  if (ASYLUM_STAT_PAGES_BASE_TITLES_MAP[statPageName]) {
    return formatAsylumExcelTitle(filters, statPageName);
  }
  return null;
}

const addExcelTotalRow = (statisticsType, data) => {
  switch (statisticsType) {
    case STATISTICS_TYPE_MAPS.ASYLUM_YEARS:
    case STATISTICS_TYPE_MAPS.ASYLUM_TOTAL: {
      const totals = {
        country_arm: "Ընդամենը",
        asylum_seeker: data.reduce((sum, item) => sum + (item.asylum_seeker || 0), 0),
        positive_decisions: data.reduce((sum, item) => sum + (item.positive_decisions || 0), 0),
        negative_decisions: data.reduce((sum, item) => sum + (item.negative_decisions || 0), 0),
        cease_decisions: data.reduce((sum, item) => sum + (item.cease_decisions || 0), 0),
      };
      return data.unshift(totals);
    }
    case STATISTICS_TYPE_MAPS.ASYLUM_APPLICATIONS:
    case STATISTICS_TYPE_MAPS.ASYLUM_DECISIONS:
    case STATISTICS_TYPE_MAPS.B_CROSS_TOTAL:
    case STATISTICS_TYPE_MAPS.B_CROSS_COUNTRIES:
    case STATISTICS_TYPE_MAPS.B_CROSS_PERIOD:
    case STATISTICS_TYPE_MAPS.WP_SIMPLE: {
      const firstField = Object.keys(data[0])[0];
      const totals = { [firstField]: "Ընդամենը" };

      const numericFields = Object.keys(data[0]).filter((key) => key !== firstField);

      numericFields.forEach((field) => {
        totals[field] = data.reduce((sum, item) => sum + Number(item[field] || 0), 0);
      });

      data.unshift(totals);
      return data;
    }
    default:
      return data;
  }
};

const addExcelTitleRow = ({ worksheet, filters, statisticsType }) => {
  const title = buildStatExcelTitle(filters, statisticsType);

  if (!title) return;
  worksheet.addRow([title]);
};

function formatWpSimpleExcelTitle(filters, statPageName) {
  const periodLabel = formatPeriodLabel(filters.period, filters.month);
  const yearLabel = filters.year ? `${filters.year}թ.` : "";
  const decisionLabel = !filters?.decType
    ? "ստացված դիմումների"
    : filters?.decType === "allow"
      ? "բավարարման որոշումների"
      : filters?.decType === "reject"
        ? "մերժման որոշումների"
        : filters?.decType === "cease"
          ? "կարճման որոշումների"
          : filters?.decType === "terminate"
            ? "դադարեցման որոշումների"
            : "";
  const claimLabel =
    filters?.claim_type === "extension"
      ? "երկարաձգման"
      : filters?.claim_type === "status_claim"
        ? "առաջնային"
        : "";
  return `${
    WP_SIMPLE_STAT_PAGES_BASE_TITLES_MAP[filters.wp_type]
  } ${claimLabel} ${decisionLabel} վիճակագրությունը ${yearLabel} ${periodLabel}`;
}

function formatBorderCrossExcelTitle(filters, statPageName) {
  const periodLabel = formatPeriodLabel(filters.period, filters.month);
  const typeLabel =
    filters?.borderCross === "point"
      ? "ըստ անցակետերի"
      : filters?.borderCross === "type"
        ? "ըստ տեսակի"
        : "";
  const yearLabel = !filters?.year
    ? ""
    : Array.isArray(filters.year)
      ? `${filters.year.join(",")}թ`
      : `${filters.year}թ.`;

  return `${BORDER_CROSS_STAT_PAGES_BASE_TITLES_MAP[statPageName]} ${typeLabel} ${yearLabel} ${periodLabel}`;
}

function formatAsylumExcelTitle(filters, statPageName) {
  const periodLabel = formatPeriodLabel(filters.period, filters.month);
  const decisionLabel = formatDecisionLabel(filters.decType);
  const yearLabel = filters.year ? `${filters.year}թ.` : "";

  return `${ASYLUM_STAT_PAGES_BASE_TITLES_MAP[statPageName]} ${decisionLabel} ${yearLabel} ${periodLabel}`;
}

export {
  sanitizeData,
  formatAsylumQuery,
  mergeAndAlignCells,
  formatEaeuEmployeeApplicationsQuery,
  formatEaeuEmployeeDecisionsQuery,
  formatEaeuEmployeeFamApplicationsQuery,
  formatEaeuEmployeeFamDecisionsQuery,
  formatWpApplicationsQuery,
  formatWpDecisionsQuery,
  formatVolunteerApplicationsQuery,
  formatExcelMetaData,
  formatTotalAsylumQuery,
  formatTotalBorderCrossQuery,
  formatPeriodBorderCrossQuery,
  formatCountryBorderCrossQuery,
  formatEaeuOfficialQuery,
  formatEaeuEmployeeFamOfficialQuery,
  formatWpOfficialQuery,
  mapWpData,
  mapEaeuFamData,
  formatStatisticsPeriodsQuery,
  addExcelTotalRow,
  addExcelTitleRow,
  formatVolunteerDecisionsQuery,
};
