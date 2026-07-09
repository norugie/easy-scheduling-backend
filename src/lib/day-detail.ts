type AssignmentForDate = {
  id: number;
  startDate: string;
  endDate: string;
};

type AssignmentExceptionForDate = {
  substituteAssignmentId: number;
  date: string;
  reason: string | null;
};

export function splitAssignmentsForDate<T extends AssignmentForDate>(
  assignments: T[],
  exceptions: AssignmentExceptionForDate[],
) {
  const exceptionsByAssignmentId = new Map(
    exceptions.map((exception) => [exception.substituteAssignmentId, exception]),
  );

  return assignments.reduce(
    (result, assignment) => {
      const exception = exceptionsByAssignmentId.get(assignment.id);

      if (exception) {
        result.canceledAssignments.push({ ...assignment, exception });
      } else {
        result.assignments.push(assignment);
      }

      return result;
    },
    {
      assignments: [] as T[],
      canceledAssignments: [] as Array<T & { exception: AssignmentExceptionForDate }>,
    },
  );
}
