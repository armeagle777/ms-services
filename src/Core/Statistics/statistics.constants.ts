export const statByYearQuery = `
SELECT
    YEAR(asylum_general_stats.period) AS period_year,

    COUNT(
        IF(asylum_general_stats.TABLE_NAME = 'table_1',
           asylum_general_stats.count_parametr, NULL)
    ) AS asylum_seeker,

\    COUNT(
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
        NULL AS decision_type,
        'table_1' AS TABLE_NAME
    FROM tb_case a
    INNER JOIN tb_person b ON a.case_id = b.case_id


    UNION ALL
    SELECT
        d.case_id,
        prs.personal_id AS count_parametr,  
        DATE(d.decison_date) AS period,
        d.decision_type,
        'table_2' AS TABLE_NAME
    FROM tb_decisions d
    INNER JOIN tb_case cs      ON cs.case_id = d.case_id
    INNER JOIN tb_person prs   ON prs.case_id = cs.case_id
    WHERE
        d.decision_status = 5         
        AND d.actual = 1              
) AS asylum_general_stats

GROUP BY YEAR(asylum_general_stats.period);
`;

export const statisticsBaseQuery = `SELECT
EAEU_STAT.country_arm,

count(if(EAEU_STAT.sex = 2  AND EAEU_STAT.age <= 13, EAEU_STAT.personal_id, null)) AS FEMALE_0_13,
count(if(EAEU_STAT.sex = 1  AND EAEU_STAT.age <= 13, EAEU_STAT.personal_id, null)) AS MALE_0_13,
count(if( EAEU_STAT.age <= 13, EAEU_STAT.personal_id, null)) AS TOTAL_0_13,

count(if(EAEU_STAT.sex = 2 AND EAEU_STAT.age > 13 AND EAEU_STAT.age <= 17, EAEU_STAT.personal_id, null)) AS FEMALE_14_17,
count(if(EAEU_STAT.sex = 1 AND EAEU_STAT.age > 13 AND EAEU_STAT.age <= 17, EAEU_STAT.personal_id, null)) AS MALE_14_17,
count(if(EAEU_STAT.age > 13 AND EAEU_STAT.age <= 17, EAEU_STAT.personal_id, null)) AS TOTAL_14_17,

count(if(EAEU_STAT.sex = 2 AND EAEU_STAT.age > 17 AND EAEU_STAT.age <= 34, EAEU_STAT.personal_id, null)) AS FEMALE_18_34,
count(if(EAEU_STAT.sex = 1 AND EAEU_STAT.age > 17 AND EAEU_STAT.age <= 34, EAEU_STAT.personal_id, null)) AS MALE_18_34,
count(if(EAEU_STAT.age > 17 AND EAEU_STAT.age <= 34, EAEU_STAT.personal_id, null)) AS TOTAL_18_34,

count(if(EAEU_STAT.sex = 2 AND EAEU_STAT.age > 34 AND EAEU_STAT.age <= 64, EAEU_STAT.personal_id, null)) AS FEMALE_35_64,
count(if(EAEU_STAT.sex = 1 AND EAEU_STAT.age > 34 AND EAEU_STAT.age <= 64, EAEU_STAT.personal_id, null)) AS MALE_35_64,
count(if(EAEU_STAT.age > 34 AND EAEU_STAT.age <= 64, EAEU_STAT.personal_id, null)) AS TOTAL_35_64,

count(if(EAEU_STAT.sex = 2 AND EAEU_STAT.age > 64, EAEU_STAT.personal_id, null)) AS FEMALE_65_PLUS,
count(if(EAEU_STAT.sex = 1 AND EAEU_STAT.age > 64, EAEU_STAT.personal_id, null)) AS MALE_65_PLUS,
count(if(EAEU_STAT.age > 64, EAEU_STAT.personal_id, null)) AS TOTAL_65_PLUS,

count(if(EAEU_STAT.sex = 2 AND EAEU_STAT.age >= 2020, EAEU_STAT.personal_id, null)) AS FEMALE_UNKNOWN,
count(if(EAEU_STAT.sex = 1 AND EAEU_STAT.age >= 2020, EAEU_STAT.personal_id, null)) AS MALE_UNKNOWN,
count(if(EAEU_STAT.age >= 2020, EAEU_STAT.personal_id, null)) AS TOTAL_UNKNOWN,

count(if(EAEU_STAT.sex = 2, EAEU_STAT.personal_id, null)) AS TOTAL_FEMALE,
count(if(EAEU_STAT.sex = 1, EAEU_STAT.personal_id, null)) AS TOTAL_MALE,
count(EAEU_STAT.personal_id) AS TOTAL_APPLICATIONS
`;

export const decTypeTableNameMap = {
  1: "refugees",
  2: "denied_refugees",
  3: "asylum_closed",
  4: "terminate",
};

export const monthsMap = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

export const periodsMap = {
  H1: "h1",
  H2: "h2",
  ANNUAL: "annual",
  Q1: "q1",
  Q2: "q2",
  Q3: "q3",
  Q4: "q4",
  "9MONTHLY": "9monthly",
  MONTHLY: "monthly",
};

export const STATISTICS_TYPE_MAPS = {
  B_CROSS_TOTAL: "borderCrossTotal",
  B_CROSS_COUNTRIES: "borderCrossCountries",
  B_CROSS_PERIOD: "borderCrossPeriod",
  ASYLUM_TOTAL: "asylumTotal",
  ASYLUM_APPLICATIONS: "asylumApplications",
  ASYLUM_DECISIONS: "asylumDecisions",
  ASYLUM_YEARS: "asylumYears",
  WP_SIMPLE: "wpSimple",
};

const getCurrentDate = () => {
  const monthLocaleMaps = {
    "01": "Հունվարի",
    "02": "Փետրվարի",
    "03": "Մարտի",
    "04": "Ապրիլի",
    "05": "Մայիսի",
    "06": "Հունիսի",
    "07": "Հուլիսի",
    "08": "Օգոստոսի",
    "09": "Սեպտեմբերի",
    10: "Հոկտեմբերի",
    11: "Նոյեմբերի",
    12: "Դեկտեմբերի",
  };
  const curDate = new Date().toLocaleString();
  const [date, time] = curDate.split(", ");
  const [day, month, year] = date.split(".");
  return { day, month: monthLocaleMaps[month], year };
};

export const reportsBasicData = {
  reporterBody:
    "Հայաստանի Հանրապետության Ներքին գործերի նախարարության միգրացիայի և քաղաքացիության ծառայությունը",
  reporterPhoneNumbers: ["011-275-021", "011-275-019"],
  reporterEmail: "aghazaryann@gov.am",
  reporterHead: "Ղազարյան Արմեն",
  reporterPerson: "Մաթևոսյան Վարդան",
  reporterDevision: "Մարդահամարի եւ ժողովրդագրության բաժին",
  devisionPhone: "52-45-28",
  devisionEmail: "info@armstat.am",
  reportingDate: getCurrentDate(), // { day: "", month: "", year: "" },
};

export const ASYLUM_STAT_PAGES_BASE_TITLES_MAP = {
  asylumTotal: "Ապաստան հայցողների ընդհանուր վիճակագրությունը",
  asylumYears: "Ապաստան հայցողների ընդհանուր վիճակագրությունը ըստ տարիների",
  asylumApplications: "Ապաստան հայցողների դիմումների վիճակագրությունը",
  asylumDecisions: "Ապաստանի տրամադրման ",
};

export const WP_SIMPLE_STAT_PAGES_BASE_TITLES_MAP = {
  volunteer: "Կամավորների",
  work_permit: "Օտարեկրացիների",
  eaeu_employee_family: "ԵԱՏՄ ընտանիքների",
  eaeu_employee: "ԵԱՏՄ քաղաքացիների",
};

export const BORDER_CROSS_STAT_PAGES_BASE_TITLES_MAP = {
  borderCrossTotal: "Սահմանահատումների ընդհանուր վիճակագրությունն",
  borderCrossCountries: "Սահմանահատումների վիճակագրությունն ըստ երկրների",
  borderCrossPeriod: "Սահմանահատումների վիճակագրությունն ըստ ժամանակահատվածների",
};

export const MOCK_MONTHS = {
  1: "Հունվար",
  2: "Փետրվար",
  3: "Մարտ",
  4: "Ապրիլ",
  5: "Մայիս",
  6: "Հունիս",
  7: "Հուլիս",
  8: "Օգոստոս",
  9: "Սեպտեմբեր",
  10: "Հոկտեմբեր",
  11: "Նոյեմբեր",
  12: "Դեկտեմբեր",
};

export { getCurrentDate };
