import { Request, Response } from "express";
import format from "pg-format";
import { client } from "../database";
import {
  iDeveloper,
  iDeveloperId,
  iDeveloperInfoResult,
  iDeveloperResult,
} from "../interfaces/interfaces";

const createDeveloper = async (
  request: Request,
  response: Response
): Promise<Response | void> => {
  const { name, email } = request.body;
  const createDeveloperRequest: iDeveloper = { name, email };
  const keysDeveloper = Object.keys(request.body);
  const verifyKeysDeveloperName = keysDeveloper.find((e: string) => {
    return e === "name";
  });
  const verifyKeysDeveloperEmail = keysDeveloper.find((e: string) => {
    return e === "email";
  });

  if (
    verifyKeysDeveloperName !== "name" ||
    verifyKeysDeveloperEmail !== "email"
  ) {
    return response
      .status(400)
      .json({ message: "Missing required keys: name and email" });
  }
  if (verifyKeysDeveloperName && verifyKeysDeveloperEmail) {
    const queryCreateDeveloperString: string = format(
      `
      INSERT INTO
          developers(%I)
      VALUES
          (%L)
      RETURNING *;
      `,
      Object.keys(createDeveloperRequest),
      Object.values(createDeveloperRequest)
    );

    const queryCreateDevelopResult: iDeveloperInfoResult = await client.query(
      queryCreateDeveloperString
    );
    return response.status(201).json(queryCreateDevelopResult.rows[0]);
  }
};

const findDeveloperById = async (id: string) => {
  let found;
  const queryShowDevelopers = `
  SELECT
      *
  FROM 
      developers; 
`;
  const queryShowDevelopersResult: iDeveloperResult = await client.query(
    queryShowDevelopers
  );
  const validateId = queryShowDevelopersResult.rows.find((e: iDeveloperId) => {
    return e.id === Number(id);
  });
  if (validateId) {
    return (found = 200);
  } else {
    return (found = 404);
  }
};

const showDevelopers = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryShowDevelopers = `
  SELECT
      devs."id" AS "developerID",
      devs."name" AS "developerName",
      devs."email" AS "developerEmail",
      devs."developerInfoId" AS "developerInfoID",

      infos."developerSince" AS "developerInfoDeveloperSince",
      infos."preferredOS" AS "developerInfoPreferredOS"
  FROM developers AS devs
  LEFT JOIN developer_infos AS infos
  ON devs."developerInfoId" = infos."id"; 
`;
  const queryShowDevelopersResult: iDeveloperResult = await client.query(
    queryShowDevelopers
  );

  return response.status(200).json(queryShowDevelopersResult.rows);
};

const showDeveloperById = async (
  request: Request,
  response: Response
): Promise<Response | void> => {
  const developerId = findDeveloperById(request.params.id);
  if (Number(await developerId) == 404) {
    return response.status(404).json({ message: "Developer not found" });
  }
  if (Number(await developerId) == 200) {
    const queryShowDevelopers = `
     SELECT
          devs."id" AS "developerID",
          devs."name" AS "developerName",
          devs."email" AS "developerEmail",
          devs."developerInfoId" AS "developerInfoID",

          infos."developerSince" AS "developerInfoDeveloperSince",
          infos."preferredOS" AS "developerInfoPreferredOS"
     FROM developer_infos AS infos
     RIGHT JOIN developers AS devs
         ON devs."developerInfoId" = infos.id
     WHERE devs.id = $1 ; 
   `;
    const queryConfig = {
      text: queryShowDevelopers,
      values: [Number(request.params.id)],
    };
    const queryShowDevelopersResult: iDeveloperResult = await client.query(
      queryConfig
    );
    return response.status(200).json(queryShowDevelopersResult.rows);
  }
};

async function findDeveloperByIdUpdate(
  request: Request,
  response: Response
): Promise<Response | number> {
  let found = 0;
  const querySearchDeveloper = `
    SELECT
        *
    FROM
        developers;
  `;
  const querySearchDeveloperResult: iDeveloperResult = await client.query(
    querySearchDeveloper
  );
  const findDeveloper = querySearchDeveloperResult.rows.find(
    (e: iDeveloperId) => {
      return e.id === Number(request.params.id);
    }
  );

  if (!findDeveloper) {
    return response.status(404).json({ message: "Developer not found" });
  }
  return (found = 200);
}

const updateDeveloper = async (request: Request, response: Response) => {
  const verifyFindDeveloperByID = await findDeveloperByIdUpdate(
    request,
    response
  );

  if (!request.body.name && !request.body.email) {
    return response.status(400).json({
      message: "At least one of those keys must be send.",
      keys: ["name", "email"],
    });
  }

  const id = request.params.id;
  const queryUpdateString = `
      UPDATE developers
      SET
        name = COALESCE($1, name),
        email = COALESCE($2, email)
      WHERE id = $3;
      `;
  const values = [];
  values.push(request.body.name);
  values.push(request.body.email);
  values.push(id);

  await client.query(queryUpdateString, values);

  const queryShowDeveloper = `
          SELECT
              *
          FROM
              developers;
      `;
  const queryShowDeveloperResult: iDeveloperResult = await client.query(
    queryShowDeveloper
  );

  const value = queryShowDeveloperResult.rows.find((e: iDeveloperId) => {
    return e.id === Number(request.params.id);
  });

  if (verifyFindDeveloperByID === 200) {
    return response.status(200).json(value);
  }
};

const deleteDeveloperById = async (
  request: Request,
  response: Response
): Promise<Response | void> => {
  const verifyIdExists = await findDeveloperByIdUpdate(request, response);
  if (verifyIdExists === 200) {
    const id = request.params.id;
    const queryDeleteDeveloper = `
        DELETE FROM developers WHERE id = $1;
              `;
    const value = [];
    value.push(id);
    await client.query(queryDeleteDeveloper, value);
    return response.status(204).json();
  }
};

const findProjectById = async (request: Request, response: Response) => {
  let found = 0;
  const querySearchDeveloper = `
      SELECT
          *
      FROM
          developers;
    `;
  const querySearchDeveloperResult: iDeveloperResult = await client.query(
    querySearchDeveloper
  );
  const findDeveloper = querySearchDeveloperResult.rows.find(
    (e: iDeveloperId) => {
      return e.id === Number(request.params.id);
    }
  );

  if (!findDeveloper) {
    return response.status(404).json({ message: "Developer not found" });
  }
  return (found = 200);
};

const showProjectsByDeveloperId = async (
  request: Request,
  response: Response
): Promise<Response | void> => {
  const validateId = findProjectById(request, response);

  if (Number(await validateId) === 200) {
    const queryShowDevelopers = `
      SELECT 
          dev."id" AS "developerID",
          dev."name" AS "developerName",
          dev."email" AS "developerEmail",
          dev."developerInfoId",

          dinf."developerSince" AS "developerInfoDeveloperSince",
          dinf."preferredOS" AS "developerInfoPreferredOS",

          pj."id" AS "projectID",
          pj."name" AS "projectName",
          pj."description" AS "projectDescription",
          pj."estimatedTime" AS "projectEstimatedTime",
          pj."repository" AS "projectRepository",
          pj."startDate" AS "projectStartDate",
          pj."endDate" AS "projectEndDate",
          
          tc."id" AS "technologyId",
          tc."technologyName"
      FROM developers AS dev
      RIGHT JOIN developer_infos AS dinf ON dev."developerInfoId" = dinf."id"
      JOIN projects AS pj ON pj."developerId" = dev.id
      FULL JOIN projects_technologies AS pt ON pt."projectId" = pj.id
      FULL JOIN technologies AS tc ON pt."technologyId" = tc.id
      WHERE dev."id" = $1;
       `;
    const queryConfig = {
      text: queryShowDevelopers,
      values: [Number(request.params.id)],
    };
    const queryShowDevelopersResult: iDeveloperResult = await client.query(
      queryConfig
    );

    return response.status(200).json(queryShowDevelopersResult.rows);
  }
};

export {
  createDeveloper,
  showDevelopers,
  findDeveloperById,
  showDeveloperById,
  updateDeveloper,
  findDeveloperByIdUpdate,
  deleteDeveloperById,
  showProjectsByDeveloperId,
  findProjectById,
};
