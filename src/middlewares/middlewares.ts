import { NextFunction, Request, Response } from "express";
import { client } from "../database";
import { iDeveloper, iDeveloperResult } from "../interfaces/interfaces";

const verifyCreateDeveloper = async (
  request: Request,
  response: Response,
  next: NextFunction
): Promise<Response | void> => {
  const queryShowDevelopers = `
          SELECT
              *
          FROM
              developers;
      `;
  const queryShowDevelopersResult: iDeveloperResult = await client.query(
    queryShowDevelopers
  );
  const findDeveloper = queryShowDevelopersResult.rows.find((e: iDeveloper) => {
    return e.email === request.body.email;
  });
  if (findDeveloper) {
    return response.status(409).json({ message: "Email already exists." });
  }
  return next();
};

export { verifyCreateDeveloper };
