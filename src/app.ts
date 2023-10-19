import express, { Application } from "express";
import { startDatabase } from "./database";
import {
  createDeveloper,
  showDevelopers,
  showDeveloperById,
  updateDeveloper,
  deleteDeveloperById,
  showProjectsByDeveloperId,
} from "./logics/developers.logics";
import {
  createDeveloperInfos,
  updateDeveloperInfos,
} from "./logics/developer_infos.logics";
import {
  createProject,
  deleteProjectByDeveloperId,
  showProjects,
  showProjectsById,
  updateProjects,
  addTechToProject,
  deleteTechAndProjectRelation,
} from "./logics/projects.logics";
import { verifyCreateDeveloper } from "./middlewares/middlewares";

const app: Application = express();
app.use(express.json());

app.post("/developers", verifyCreateDeveloper, createDeveloper);
app.get("/developers", showDevelopers);
app.get("/developers/:id", showDeveloperById);
app.get("/developers/:id/projects", showProjectsByDeveloperId);
app.post("/developers/:id/infos", createDeveloperInfos);
app.patch("/developers/:id", verifyCreateDeveloper, updateDeveloper);
app.patch("/developers/:id/infos", updateDeveloperInfos);
app.delete("/developers/:id", deleteDeveloperById);
app.post("/projects", createProject);
app.get("/projects", showProjects);
app.get("/projects/:id", showProjectsById);
app.patch("/projects/:id", updateProjects);
app.delete("/projects/:id", deleteProjectByDeveloperId);
app.post("/projects/:id/technologies", addTechToProject);
app.delete("/projects/:id/technologies/:name", deleteTechAndProjectRelation);

app.listen(3000, async () => {
  console.log("Server is running!");
  await startDatabase();
});
