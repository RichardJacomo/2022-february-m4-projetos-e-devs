import { Request, Response } from "express";
import {
  findDeveloperById,
  findDeveloperByIdUpdate,
} from "../logics/developers.logics";
import { iDeveloperInfo, iDeveloperInfoResult } from "../interfaces/interfaces";
import format from "pg-format";
import { client } from "../database";
import { QueryConfig } from "pg";

const createDeveloperInfos = async (
  request: Request,
  response: Response
): Promise<Response | void> => {
  const developerId: number = Number(request.params.id);
  const { developerSince, preferredOS } = request.body;
  const createDeveloperRequest = { developerSince, preferredOS };
  const developerIdSearch = findDeveloperById(request.params.id);
  if (Number(await developerIdSearch) === 404) {
    return response.status(404).json({ message: "Developer not found" });
  }

  if (
    request.body.preferredOS !== "MacOS" &&
    request.body.preferredOS !== "Windows" &&
    request.body.preferredOS !== "Linux"
  ) {
    return response.status(400).json({
      message: "Invalid OS option.",
      options: ["Windows", "Linux", "MacOS"],
    });
  }

  const queryStringDeveloper = `
    SELECT *
    FROM developers
    WHERE id = $1;
  `;
  let value = [request.params.id];
  const queryResultDeveloper = await client.query(queryStringDeveloper, value);
  const verifyDeveloperHaveInfo = queryResultDeveloper.rows[0].developerInfoId;

  const keysDeveloper = Object.keys(request.body);
  const verifyKeyDeveloperSince = keysDeveloper.find((e: string) => {
    return e === "developerSince";
  });
  const verifyKeysPreferredOS = keysDeveloper.find((e: string) => {
    return e === "preferredOS";
  });
  if (verifyDeveloperHaveInfo !== null) {
    return response.status(400).json({
      message: "Developer infos already exists.",
    });
  }

  if (verifyKeyDeveloperSince && verifyKeysPreferredOS) {
    if (Number(await developerIdSearch) === 200) {
      let queryString: string = format(
        `
          INSERT INTO
              developer_infos (%I)
          VALUES(%L)
          RETURNING *;    
        `,
        Object.keys(createDeveloperRequest),
        Object.values(createDeveloperRequest)
      );
      let queryResult = await client.query(queryString);

      queryString = `
          UPDATE
              developers
          SET
              "developerInfoId" = $1
          WHERE
              id = $2
          RETURNING *;            
        `;
      const queryConfig: QueryConfig = {
        text: queryString,
        values: [queryResult.rows[0].id, developerId],
      };
      queryResult = await client.query(queryConfig);

      const queryStringInfos = `
        SELECT
              *
        FROM
          developer_infos
        WHERE id = $1;  
      `;

      const queryConfigInfos = {
        text: queryStringInfos,
        values: [queryResult.rows[0].developerInfoId],
      };
      const queryResultInfos = await client.query(queryConfigInfos);

      return response.status(201).json(queryResultInfos.rows[0]);
    }
  } else {
    return response
      .status(400)
      .json({ message: "developerSince, preferredOS." });
  }
};

const updateDeveloperInfos = async (
  request: Request,
  response: Response
): Promise<Response> => {
  const developerInfoId: number = Number(request.params.id);
  const developerInfoBody: iDeveloperInfo = request.body;

  if (!request.body.developerSince && !request.body.preferredOS) {
    return response.status(400).json({
      message: "At least one of those keys must be send.",
      keys: ["developerSince", "preferredOS"],
    });
  }

  if (
    request.body.preferredOS !== "MacOS" &&
    request.body.preferredOS !== "Windows" &&
    request.body.preferredOS !== "Linux"
  ) {
    return response.status(400).json({
      message: "Invalid OS option.",
      options: ["Windows", "Linux", "MacOS"],
    });
  }

  await findDeveloperByIdUpdate(request, response);
  const queryString: string = `
    UPDATE
        developer_infos
    SET
        "preferredOS" = COALESCE($1, "preferredOS"),
        "developerSince" = COALESCE($2, "developerSince")
    WHERE 
        id = (SELECT "developerInfoId" FROM developers WHERE id = $3)
   RETURNING *;            
  `;

  const queryConfig: QueryConfig = {
    text: queryString,
    values: [
      developerInfoBody.preferredOS,
      developerInfoBody.developerSince,
      developerInfoId,
    ],
  };

  const queryResult: iDeveloperInfoResult = await client.query(queryConfig);

  return response.status(200).json(queryResult.rows[0]);
};

export { createDeveloperInfos, updateDeveloperInfos };
