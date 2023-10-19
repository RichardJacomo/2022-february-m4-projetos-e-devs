import { Request, Response } from "express";
import { QueryConfig } from "pg";
import format from "pg-format";
import { client } from "../database";
import {
  iDeveloperId,
  iDeveloperResult,
  iProjects,
  iProjectsResult,
  iTechnology,
  iTechnologyResult,
  ListRequiredKeysData,
} from "../interfaces/interfaces";

const findDeveloperByIdProject = async (
  request: Request,
  response: Response
): Promise<Response | number> => {
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
      return e.id === Number(request.body.developerId);
    }
  );

  if (!findDeveloper) {
    return response.status(404).json({ message: "Developer not found" });
  }
  return (found = 200);
};

const validateDataProject = async (request: Request, response: Response) => {
  const payloadKeys: Array<string> = Object.keys(request.body);
  const requiredKeys: Array<ListRequiredKeysData> = [
    "name",
    "description",
    "estimatedTime",
    "repository",
    "startDate",
    "developerId",
  ];

  const containsAllRequired: boolean = requiredKeys.every((key: string) => {
    return payloadKeys.includes(key);
  });
  if (!containsAllRequired) {
    return response
      .status(400)
      .json({ message: `Required keys are: ${requiredKeys}` });
  }
};

const createProject = async (
  request: Request,
  response: Response
): Promise<Response | void> => {
  const validade = await validateDataProject(request, response);

  const {
    name,
    description,
    estimatedTime,
    repository,
    startDate,
    endDate,
    developerId,
  } = request.body;

  const requiredKeysProject = {
    name,
    description,
    estimatedTime,
    repository,
    startDate,
    endDate,
    developerId,
  };

  if (!validade) {
    let queryString: string = format(
      `
          INSERT INTO
              projects (%I)
          VALUES(%L)
          RETURNING *;    
        `,
      Object.keys(requiredKeysProject),
      Object.values(requiredKeysProject)
    );
    let queryResult = await client.query(queryString);
    return response.status(201).json(queryResult.rows[0]);
  }
};

const showProjects = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const queryShowDevelopers = `
   SELECT 
        prj."id" AS "projectID",
        prj."name" AS "projectName",
        prj."description" AS "projectDescription",
        prj."estimatedTime" AS "projectEstimatedTime",
        prj."repository" AS "projectRepository",
        prj."startDate" AS  "projectStartDate",
        prj."endDate" AS "projectEndDate",
        prj."developerId" AS "projectDeveloperID",
        ptech."technologyId" AS "technologyID",
        techs."technologyName" AS "technologyName"
   FROM projects_technologies AS ptech
   RIGHT JOIN projects AS prj ON ptech."projectId" = prj."id"
   LEFT JOIN technologies AS techs ON ptech."technologyId" = techs."id";
    `;
  const queryShowDevelopersResult: iDeveloperResult = await client.query(
    queryShowDevelopers
  );
  return response.status(200).json(queryShowDevelopersResult.rows);
};

const findProjectId = async (id: number) => {
  let found;
  const queryShowDevelopers = `
    SELECT
        *
    FROM 
        projects; 
  `;
  const queryShowDevelopersResult: iDeveloperResult = await client.query(
    queryShowDevelopers
  );
  const validateId = queryShowDevelopersResult.rows.find(
    (e: iDeveloperId) => e.id === Number(id)
  );
  if (validateId) {
    return (found = 200);
  } else {
    return (found = 404);
  }
};

const showProjectsById = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const validateId = findProjectId(Number(request.params.id));
  if (Number(await validateId) === 404) {
    return response.status(404).json({ message: "Project not found" });
  }
  const queryShowDevelopers = `
    SELECT 
         prj."id" AS "projectID",
         prj."name" AS "projectName",
         prj."description" AS "projectDescription",
         prj."estimatedTime" AS "projectEstimatedTime",
         prj."repository" AS "projectRepository",
         prj."startDate" AS  "projectStartDate",
         prj."endDate" AS "projectEndDate",
         prj."developerId" AS "projectDeveloperID",
         ptech."technologyId",
         techs."technologyName"
    FROM projects_technologies AS ptech
    RIGHT JOIN projects AS prj ON ptech."projectId" = prj."id"
    LEFT JOIN technologies AS techs ON ptech."technologyId" = techs."id"
    WHERE prj."id" = $1;
     `;
  const queryConfig = {
    text: queryShowDevelopers,
    values: [Number(request.params.id)],
  };
  const queryShowDevelopersResult: iDeveloperResult = await client.query(
    queryConfig
  );
  return response.status(200).json(queryShowDevelopersResult.rows);
};

const updateProjects = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const projectId: number = Number(request.params.id);
  const projectData: iProjects = request.body;

  const validateId = findProjectId(Number(request.params.id));
  if (Number(await validateId) === 404) {
    return response.status(404).json({ message: "Project not found" });
  }

  const queryStringProjectExist = `
    SELECT *
    FROM projects
    WHERE id = $1;
  `;
  const queryResultProjectExist = await client.query(queryStringProjectExist, [
    request.params.id,
  ]);
  if (!queryResultProjectExist.rows[0]) {
    return response.status(404).json({
      message: "Project not found.",
    });
  }

  if (
    !projectData.name &&
    !projectData.description &&
    !projectData.estimatedTime &&
    !projectData.repository &&
    !projectData.startDate &&
    !projectData.endDate &&
    !projectData.developerId
  ) {
    return response.status(400).json({
      message: "At least one of those keys must be send.",
      keys: [
        "name",
        "description",
        "estimatedTime",
        "repository",
        "startDate",
        "endDate",
        "developerId",
      ],
    });
  }

  const queryString: string = `
  UPDATE
      projects
  SET
      "name" = COALESCE($1, "name"),
      "description" = COALESCE($2, "description"),
      "estimatedTime" = COALESCE($3, "estimatedTime"),
      "repository" = COALESCE($4, "repository"),
      "startDate" = COALESCE($5, "startDate"),
      "endDate" = COALESCE($6, "endDate"),
      "developerId" = COALESCE($7, "developerId")
  WHERE 
      id = $8
 RETURNING *;            
`;
  const queryConfig: QueryConfig = {
    text: queryString,
    values: [
      projectData.name,
      projectData.description,
      projectData.estimatedTime,
      projectData.repository,
      projectData.startDate,
      projectData.endDate,
      projectData.developerId,
      projectId,
    ],
  };
  const queryResult: iProjectsResult = await client.query(queryConfig);
  return response.status(200).json(queryResult.rows[0]);
};

const findProjectByDeveloperId = async (id: number) => {
  let found;
  const queryShowProjects = `
    SELECT
        *
    FROM 
        projects; 
  `;
  const queryShowProjectsResult = await client.query(queryShowProjects);
  const validateId = queryShowProjectsResult.rows.find((e: iDeveloperId) => {
    return e.id === Number(id);
  });
  if (validateId) {
    return (found = 200);
  } else {
    return (found = 404);
  }
};

const deleteProjectByDeveloperId = async (
  request: Request,
  response: Response
): Promise<Response | void> => {
  const verifyIdExists = await findProjectByDeveloperId(
    Number(request.params.id)
  );
  if (verifyIdExists === 404) {
    return response.status(404).json({ message: "Developer not found" });
  }
  if (verifyIdExists === 200) {
    const id = request.params.id;
    const queryDeleteDeveloper = `
        DELETE FROM projects WHERE "developerId" = $1
              `;
    const value = [];
    value.push(id);
    await client.query(queryDeleteDeveloper, value);
    return response.status(204).json();
  }
};

const findTechId = async (
  request: Request,
  response: Response,
  name: string
) => {
  const queryString = `
  SELECT
      *
  FROM 
      technologies; 
`;
  const queryResult: iTechnologyResult = await client.query(queryString);
  const validateId = queryResult.rows.find((e: iTechnology) => {
    return e.technologyName === name;
  });
  if (!validateId) {
    return response.status(400).json({
      message: "Technology not supported.",
      options: [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
        "MongoDB",
      ],
    });
  }

  return validateId?.id;
};

const findProjectByIdToPost = async (request: Request, response: Response) => {
  let id: number;
  const queryString = `
  SELECT
      *
  FROM 
      projects; 
`;
  const queryResult: iProjectsResult = await client.query(queryString);
  const validateId = queryResult.rows.find((e: iProjects) => {
    return e.id === Number(request.params.id);
  });
  if (typeof validateId?.id === "number") {
    return validateId.id;
  } else {
    return response.status(404).json({ message: "Project not found" });
  }
};

const addTechToProject = async (
  request: Request,
  response: Response
): Promise<Response | void> => {
  const findTech = request.body;
  const findTechIdResult: any = await findTechId(
    request,
    response,
    findTech.name
  );

  const findProjectId: any = await findProjectByIdToPost(request, response);

  if (
    typeof findTechIdResult === "number" &&
    typeof findProjectId === "number"
  ) {
    const queryString = `
      INSERT INTO
            projects_technologies ("projectId", "technologyId", "addedIn")   
      VALUES  ($1, $2, $3);         
    `;
    const currentDate = new Date();
    const values = [];
    values.push(findProjectId);
    values.push(findTechIdResult);
    values.push(currentDate.toLocaleDateString());
    await client.query(queryString, values);

    const queryShowProjects = `
    SELECT
          tc."id" AS "technologyId",
          tc."technologyName",

          pj."id" AS "projectID",
          pj."name" AS "projectName",
          pj."description" AS "projectDescription",
          pj."estimatedTime" AS "projectEstimatedTime",
          pj."repository" AS "projectRepository",
          pj."startDate" AS "projectStartDate",
          pj."endDate" AS "projectEndDate"

      FROM projects_technologies AS pt
      RIGHT JOIN technologies AS tc ON tc."id" = pt."technologyId"
      JOIN projects AS pj ON pj."id" = pt."projectId"
      WHERE tc."id" = $1;
       `;
    const queryConfig = {
      text: queryShowProjects,
      values: [findTechIdResult],
    };
    const queryShowProjectsResult = await client.query(queryConfig);
    return response.status(201).json(queryShowProjectsResult.rows[0]);
  }
};

const findProjectPTId = async (request: Request, response: Response) => {
  let found;
  const queryShowDevelopers = `
  SELECT
      *
  FROM 
      projects; 
`;
  const queryShowDevelopersResult: iProjectsResult = await client.query(
    queryShowDevelopers
  );
  const validateId = queryShowDevelopersResult.rows.find((e: iProjects) => {
    return e.id === Number(request.params.id);
  });
  if (validateId) {
    return (found = 200);
  } else {
    return (found = 404);
  }
};

const deleteTechAndProjectRelation = async (
  request: Request,
  response: Response
) => {
  const verifyIdProjectExists = findProjectPTId(request, response);
  if (Number(await verifyIdProjectExists) === 404) {
    return response.status(404).json({ message: "Project not found" });
  }

  const queryDeleteRelation = `
        SELECT * FROM technologies;
              `;

  const queryResultFindTech = await client.query(queryDeleteRelation);

  const findTechByName = queryResultFindTech.rows.find((e: iTechnology) => {
    return e.technologyName === request.params.name;
  });

  if (!findTechByName) {
    return response.status(404).json({
      message: "Technology not supported",
      options: [
        "JavaScript",
        "Python",
        "React",
        "Express.js",
        "HTML",
        "CSS",
        "Django",
        "PostgreSQL",
        "MongoDB",
      ],
    });
  }

  if (Number(await verifyIdProjectExists) === 200) {
    const queryShowProjectsPT = `
      SELECT
            tc."id" AS "technologyId",
            tc."technologyName",

            pj."id" AS "projectID"

        FROM projects AS pj
        RIGHT JOIN projects_technologies AS pt ON pj."id" = pt."projectId"
        LEFT JOIN technologies AS tc ON tc."id" = pt."technologyId"
        WHERE pj."id" = $1;
         `;
    const queryConfigPT = {
      text: queryShowProjectsPT,
      values: [request.params.id],
    };
    const queryShowProjectsPTResult = await client.query(queryConfigPT);

    const findTechName = queryShowProjectsPTResult.rows.find(
      (e: iTechnology) => {
        return e.technologyName == request.params.name;
      }
    );
    if (findTechName) {
      const queryDeleteRelation = `
          DELETE FROM projects_technologies WHERE "technologyId" = $1 AND "projectId" = $2;
                `;
      const value = [];
      value.push(findTechName.technologyId);
      value.push(findTechName.projectID);
      await client.query(queryDeleteRelation, value);
      return response.status(204).json();
    } else if (!findTechName) {
      return response.status(404).json({
        message: "Technology not supported",
        options: [
          "JavaScript",
          "Python",
          "React",
          "Express.js",
          "HTML",
          "CSS",
          "Django",
          "PostgreSQL",
          "MongoDB",
        ],
      });
    }
  }
};

export {
  createProject,
  showProjects,
  showProjectsById,
  updateProjects,
  deleteProjectByDeveloperId,
  findDeveloperByIdProject,
  addTechToProject,
  deleteTechAndProjectRelation,
};
