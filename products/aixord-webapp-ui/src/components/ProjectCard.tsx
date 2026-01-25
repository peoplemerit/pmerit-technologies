/**
 * Project Card Component
 *
 * Displays a project summary in a card format.
 */

import type { Project } from '../lib/api';

interface ProjectCardProps {
  project: Project;
}

const realityColors = {
  GREENFIELD: 'bg-green-500/10 text-green-400 border-green-500/20',
  BROWNFIELD: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  LEGACY: 'bg-red-500/10 text-red-400 border-red-500/20',
};

const realityLabels = {
  GREENFIELD: 'Greenfield',
  BROWNFIELD: 'Brownfield',
  LEGACY: 'Legacy',
};

export function ProjectCard({ project }: ProjectCardProps) {
  const realityClass = realityColors[project.realityClassification] || realityColors.GREENFIELD;
  const realityLabel = realityLabels[project.realityClassification] || 'Unknown';

  return (
    <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:border-violet-500/50 transition-colors group">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-white group-hover:text-violet-400 transition-colors">
          {project.name}
        </h3>
        <span className={`px-2 py-1 text-xs font-medium rounded border ${realityClass}`}>
          {realityLabel}
        </span>
      </div>

      <p className="text-gray-400 text-sm mb-4 line-clamp-2">{project.objective}</p>

      <div className="flex justify-between items-center text-xs text-gray-500">
        <span>Created {new Date(project.createdAt).toLocaleDateString()}</span>
        <svg
          className="w-5 h-5 text-gray-600 group-hover:text-violet-400 transition-colors"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </div>
  );
}

export default ProjectCard;
