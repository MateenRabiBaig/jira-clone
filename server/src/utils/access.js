const mongoose = require('mongoose');
const Project = require('../models/Project');
const Task = require('../models/Task');
const Team = require('../models/Team');
const ApiError = require('./ApiError');

const isMember = (project, userId) =>
  project.members.some((m) => m.toString() === userId.toString());

const isOwner = (project, userId) => project.owner.toString() === userId.toString();

const assertObjectId = (id, label = 'identifier') => {
  if (!id || !mongoose.isValidObjectId(id)) throw new ApiError(400, `Invalid ${label}`);
};

/** Returns the project when the user is a member; otherwise 404/403. */
const getProjectForMember = async (projectId, userId) => {
  assertObjectId(projectId, 'project id');
  const project = await Project.findById(projectId);
  if (!project) throw new ApiError(404, 'Project not found');
  if (!isMember(project, userId)) throw new ApiError(403, 'You do not have access to this project');
  return project;
};

/** Returns the task (populated assignee/reporter) when the user can see it. */
const getTaskForMember = async (taskId, userId) => {
  const task = await Task.findById(taskId).populate('assignee', 'name email avatarUrl').populate('reporter', 'name email avatarUrl');
  if (!task) throw new ApiError(404, 'Task not found');
  await getProjectForMember(task.project, userId);
  return task;
};

/** Returns the team when the user is a member; otherwise 404/403. */
const getTeamForMember = async (teamId, userId) => {
  const team = await Team.findById(teamId);
  if (!team) throw new ApiError(404, 'Team not found');
  if (!team.members.some((m) => m.user.toString() === userId.toString())) {
    throw new ApiError(403, 'You do not have access to this team');
  }
  return team;
};

const memberRole = (team, userId) => {
  const entry = team.members.find((m) => m.user.toString() === userId.toString());
  return entry ? entry.role : null;
};

module.exports = { isMember, isOwner, assertObjectId, getProjectForMember, getTaskForMember, getTeamForMember, memberRole };
