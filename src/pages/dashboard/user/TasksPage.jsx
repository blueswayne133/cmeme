import { CheckSquare } from "lucide-react"

const TasksPage = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <CheckSquare size={64} className="text-gray-600" />
      <h2 className="text-2xl font-bold text-gray-100">Tasks</h2>
      <p className="text-gray-400 max-w-md">Complete tasks to earn bonus rewards</p>
    </div>
  )
}

export default TasksPage