"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Play,
  Clock,
  CheckCircle,
  Archive,
  Plus,
  FileText,
  Target,
  Calendar,
  Link,
  Unlink,
  Settings,
  ArrowRight,
  ArrowLeft,
} from "lucide-react"

// Sample order templates and data
const orderTemplates = [
  {
    id: "textile-order-1",
    name: "Textile Manufacturing Order",
    description: "Standard textile production workflow",
    phases: [
      {
        id: "design",
        name: "Design Phase",
        stages: [
          {
            id: "concept",
            name: "Concept Development",
            milestone: "Design Concept Approved",
            defaultDeadlineDays: 7,
            actions: [
              { id: "mood-board", name: "Create Mood Board", fields: ["inspiration", "colors", "themes"] },
              { id: "sketches", name: "Initial Sketches", fields: ["sketches", "notes"] },
            ],
          },
          {
            id: "technical",
            name: "Technical Design",
            milestone: "Technical Specs Complete",
            defaultDeadlineDays: 14,
            actions: [
              { id: "tech-pack", name: "Technical Package", fields: ["measurements", "materials", "construction"] },
              { id: "pattern", name: "Pattern Creation", fields: ["pattern_files", "grading"] },
            ],
          },
        ],
      },
      {
        id: "production",
        name: "Production Phase",
        stages: [
          {
            id: "sampling",
            name: "Sample Production",
            milestone: "Samples Approved",
            defaultDeadlineDays: 21,
            actions: [
              { id: "proto", name: "Prototype Creation", fields: ["sample_qty", "materials"] },
              { id: "fitting", name: "Fit Testing", fields: ["fit_notes", "adjustments"] },
            ],
          },
          {
            id: "bulk",
            name: "Bulk Production",
            milestone: "Production Complete",
            defaultDeadlineDays: 45,
            actions: [
              { id: "cutting", name: "Fabric Cutting", fields: ["cut_qty", "waste_report"] },
              { id: "sewing", name: "Garment Assembly", fields: ["production_qty", "quality_checks"] },
            ],
          },
        ],
      },
    ],
  },
]

const sampleOrders = [
  {
    id: "order-001",
    name: "Summer Collection 2024",
    templateId: "textile-order-1",
    orderItems: [
      { id: "item-1", name: "Cotton T-Shirt", sku: "CT001", quantity: 1000, color: "White" },
      { id: "item-2", name: "Cotton T-Shirt", sku: "CT001", quantity: 500, color: "Black" },
      { id: "item-3", name: "Linen Shorts", sku: "LS002", quantity: 750, color: "Beige" },
    ],
    groupingFields: ["sku", "color", "size"],
  },
  {
    id: "order-002",
    name: "Winter Collection 2024",
    templateId: "textile-order-1",
    orderItems: [
      { id: "item-4", name: "Wool Sweater", sku: "WS003", quantity: 300, color: "Navy" },
      { id: "item-5", name: "Wool Sweater", sku: "WS003", quantity: 200, color: "Gray" },
    ],
    groupingFields: ["sku", "color", "size"],
  },
  {
    id: "order-003",
    name: "Spring Accessories Line",
    templateId: "textile-order-1",
    orderItems: [
      { id: "item-6", name: "Silk Scarf", sku: "SS004", quantity: 400, color: "Floral" },
      { id: "item-7", name: "Leather Belt", sku: "LB005", quantity: 250, color: "Brown" },
    ],
    groupingFields: ["sku", "color", "size"],
  },
  {
    id: "order-004",
    name: "Corporate Uniforms Project",
    templateId: "textile-order-1",
    orderItems: [
      { id: "item-8", name: "Oxford Shirt", sku: "OS006", quantity: 1200, color: "Blue" },
      { id: "item-9", name: "Trouser Pants", sku: "TP007", quantity: 1200, color: "Gray" },
    ],
    groupingFields: ["sku", "color", "size"],
  },
]

const systemUsers = [
  { id: "john.doe@company.com", name: "John Doe", role: "Project Manager" },
  { id: "sarah.designer@company.com", name: "Sarah Wilson", role: "Designer" },
  { id: "mike.technical@company.com", name: "Mike Chen", role: "Technical Lead" },
  { id: "production.team@company.com", name: "Production Team", role: "Production" },
  { id: "qc.team@company.com", name: "QC Team", role: "Quality Control" },
  { id: "design.team@company.com", name: "Design Team", role: "Design" },
  { id: "production.manager@company.com", name: "Alex Rodriguez", role: "Production Manager" },
]

// Types
type TicketStatus = "backlog" | "todo" | "in-progress" | "done"
type TaskType = "milestone" | "linked" | "unlinked"

interface MilestoneConfig {
  milestoneId: string
  milestoneName: string
  phaseId: string
  stageId: string
  isOrderLevel: boolean
  groupingField?: string
  deadlineDays: number
}

interface GeneratedTicket {
  id: string
  title: string
  description: string
  type: TaskType
  status: TicketStatus
  assignee?: string
  deadline?: Date
  milestoneId?: string
  orderItemId?: string
  dependencies: string[]
  fields: Array<{ name: string; label: string; type: string; required: boolean; value?: any }>
}

interface CustomTask {
  id: string
  name: string
  description: string
  type: "linked" | "unlinked"
  assignee?: string
  deadline?: Date
  linkedMilestoneId?: string
  offsetDays?: number
  offsetType?: "before" | "after"
}

interface Project {
  id: string
  name: string
  orderId: string
  templateId: string
  status: "active" | "completed" | "paused"
  createdAt: Date
  tickets: GeneratedTicket[]
}

export default function WorkflowProjectManagement() {
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [showCreateProject, setShowCreateProject] = useState(false)
  const [selectedTicket, setSelectedTicket] = useState<GeneratedTicket | null>(null)
  const [currentUser, setCurrentUser] = useState("john.doe@company.com")
  const [viewMode, setViewMode] = useState<"project" | "my-tickets">("project")
  const [showLandingPage, setShowLandingPage] = useState(true)

  // Project Configuration State
  const [configStep, setConfigStep] = useState(1) // 1: Order Selection, 2: Milestone Config, 3: Task Creation, 4: Preview
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null)
  const [milestoneConfigs, setMilestoneConfigs] = useState<MilestoneConfig[]>([])
  const [generatedTickets, setGeneratedTickets] = useState<GeneratedTicket[]>([])
  const [customTasks, setCustomTasks] = useState<CustomTask[]>([])
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [projectName, setProjectName] = useState("")

  // Initialize with sample projects
  useEffect(() => {
    const project1 = createSampleProjectWithTickets("Summer Collection 2024", "order-001")
    const project2 = createSampleProjectWithTickets("Winter Collection 2024", "order-002")
    const project3 = createSampleProjectWithTickets("Spring Accessories Line", "order-003")
    const project4 = createSampleProjectWithTickets("Corporate Uniforms Project", "order-004")

    setProjects([project1, project2, project3, project4])
    // Don't auto-select a project - show landing page instead
    setSelectedProject(null)
  }, [])

  function createSampleProjectWithTickets(name: string, orderId: string): Project {
    const project: Project = {
      id: `proj-${Date.now()}-${Math.random()}`,
      name,
      orderId,
      templateId: "textile-order-1",
      status: Math.random() > 0.7 ? "completed" : Math.random() > 0.3 ? "active" : "paused",
      createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Random date within last 30 days
      tickets: generateDummyTickets(name),
    }
    return project
  }

  function generateDummyTickets(projectName: string): GeneratedTicket[] {
    const sampleTickets: GeneratedTicket[] = [
      {
        id: `ticket-${Date.now()}-1`,
        title: "Design Concept Approval",
        description: `Create and approve initial design concepts for ${projectName}`,
        type: "milestone",
        status: "done",
        assignee: "sarah.designer@company.com",
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        dependencies: [],
        fields: [
          {
            name: "concept_sketches",
            label: "Concept Sketches",
            type: "file",
            required: true,
            value: "sketches_v1.pdf",
          },
          { name: "color_palette", label: "Color Palette", type: "text", required: true, value: "Navy, White, Gray" },
        ],
      },
      {
        id: `ticket-${Date.now()}-2`,
        title: "Technical Specifications",
        description: `Develop detailed technical specifications and measurements`,
        type: "milestone",
        status: "in-progress",
        assignee: "mike.technical@company.com",
        deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        dependencies: [],
        fields: [
          {
            name: "measurements",
            label: "Measurements",
            type: "textarea",
            required: true,
            value: "Chest: 42in, Length: 28in",
          },
          { name: "materials", label: "Materials List", type: "textarea", required: true, value: "" },
        ],
      },
      {
        id: `ticket-${Date.now()}-3`,
        title: "Sample Production - Cotton T-Shirt",
        description: `Produce initial samples for Cotton T-Shirt variants`,
        type: "milestone",
        status: "todo",
        assignee: "production.team@company.com",
        deadline: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
        dependencies: [],
        fields: [
          { name: "sample_qty", label: "Sample Quantity", type: "number", required: true, value: "" },
          { name: "fabric_source", label: "Fabric Source", type: "select", required: true, value: "" },
        ],
      },
      {
        id: `ticket-${Date.now()}-4`,
        title: "Quality Control Review",
        description: `Conduct quality control review of produced samples`,
        type: "milestone",
        status: "backlog",
        assignee: "qc.team@company.com",
        deadline: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        dependencies: [],
        fields: [
          { name: "qc_checklist", label: "QC Checklist", type: "file", required: true, value: "" },
          { name: "defect_report", label: "Defect Report", type: "textarea", required: false, value: "" },
        ],
      },
      {
        id: `ticket-${Date.now()}-5`,
        title: "Packaging Design",
        description: `Design packaging and labeling for the product line`,
        type: "linked",
        status: "todo",
        assignee: "design.team@company.com",
        deadline: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        dependencies: [],
        fields: [
          { name: "package_design", label: "Package Design", type: "file", required: true, value: "" },
          { name: "label_copy", label: "Label Copy", type: "textarea", required: true, value: "" },
        ],
      },
      {
        id: `ticket-${Date.now()}-6`,
        title: "Bulk Production Planning",
        description: `Plan and schedule bulk production runs`,
        type: "milestone",
        status: "backlog",
        assignee: "production.manager@company.com",
        deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
        dependencies: [],
        fields: [
          { name: "production_schedule", label: "Production Schedule", type: "file", required: true, value: "" },
          { name: "resource_allocation", label: "Resource Allocation", type: "textarea", required: true, value: "" },
        ],
      },
    ]

    // Randomize some ticket statuses and assignments
    return sampleTickets.map((ticket) => ({
      ...ticket,
      status:
        Math.random() > 0.7 ? "done" : Math.random() > 0.4 ? "in-progress" : Math.random() > 0.2 ? "todo" : "backlog",
      assignee: Math.random() > 0.3 ? ticket.assignee : currentUser,
    }))
  }

  // Project Configuration Functions
  function handleOrderSelection(orderId: string) {
    const order = sampleOrders.find((o) => o.id === orderId)
    const template = orderTemplates.find((t) => t.id === order?.templateId)

    if (order && template) {
      setSelectedOrder(order)
      setSelectedTemplate(template)

      // Initialize milestone configurations
      const configs: MilestoneConfig[] = []
      template.phases.forEach((phase) => {
        phase.stages.forEach((stage) => {
          configs.push({
            milestoneId: `${phase.id}-${stage.id}`,
            milestoneName: stage.milestone,
            phaseId: phase.id,
            stageId: stage.id,
            isOrderLevel: true,
            deadlineDays: stage.defaultDeadlineDays,
          })
        })
      })
      setMilestoneConfigs(configs)
    }
  }

  function updateMilestoneConfig(milestoneId: string, updates: Partial<MilestoneConfig>) {
    setMilestoneConfigs((prev) =>
      prev.map((config) => (config.milestoneId === milestoneId ? { ...config, ...updates } : config)),
    )
  }

  function generateTicketsFromConfig() {
    if (!selectedOrder || !selectedTemplate) return

    const tickets: GeneratedTicket[] = []

    milestoneConfigs.forEach((config) => {
      if (config.isOrderLevel) {
        // Generate one ticket for the entire order
        const ticket: GeneratedTicket = {
          id: `ticket-${config.milestoneId}-order`,
          title: `${config.milestoneName} - Order Level`,
          description: `Complete ${config.milestoneName} for entire order`,
          type: "milestone",
          status: "backlog",
          deadline: new Date(Date.now() + config.deadlineDays * 24 * 60 * 60 * 1000),
          milestoneId: config.milestoneId,
          dependencies: [],
          fields: [],
        }
        tickets.push(ticket)
      } else {
        // Generate tickets based on grouping
        const groupedItems = groupOrderItems(selectedOrder.orderItems, config.groupingField || "sku")

        Object.entries(groupedItems).forEach(([groupKey, items]) => {
          const ticket: GeneratedTicket = {
            id: `ticket-${config.milestoneId}-${groupKey}`,
            title: `${config.milestoneName} - ${groupKey}`,
            description: `Complete ${config.milestoneName} for ${groupKey} (${items.length} items)`,
            type: "milestone",
            status: "backlog",
            deadline: new Date(Date.now() + config.deadlineDays * 24 * 60 * 60 * 1000),
            milestoneId: config.milestoneId,
            dependencies: [],
            fields: [],
          }
          tickets.push(ticket)
        })
      }
    })

    // Add custom tasks
    customTasks.forEach((task) => {
      const ticket: GeneratedTicket = {
        id: `ticket-custom-${task.id}`,
        title: task.name,
        description: task.description,
        type: task.type,
        status: "backlog",
        assignee: task.assignee,
        deadline: task.deadline,
        dependencies: [],
        fields: [],
      }
      tickets.push(ticket)
    })

    setGeneratedTickets(tickets)
  }

  function groupOrderItems(items: any[], field: string) {
    return items.reduce((groups, item) => {
      const key = item[field] || "ungrouped"
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
      return groups
    }, {})
  }

  function addCustomTask(task: Omit<CustomTask, "id">) {
    const newTask: CustomTask = {
      ...task,
      id: `task-${Date.now()}`,
    }
    setCustomTasks((prev) => [...prev, newTask])
  }

  function createProjectFromConfig() {
    if (!selectedOrder || !projectName) return

    const project: Project = {
      id: `proj-${Date.now()}`,
      name: projectName,
      orderId: selectedOrder.id,
      templateId: selectedOrder.templateId,
      status: "active",
      createdAt: new Date(),
      tickets: generatedTickets,
    }

    setProjects((prev) => [...prev, project])
    setSelectedProject(project)
    resetConfiguration()
    setShowCreateProject(false)
  }

  function resetConfiguration() {
    setConfigStep(1)
    setSelectedOrder(null)
    setSelectedTemplate(null)
    setMilestoneConfigs([])
    setGeneratedTickets([])
    setCustomTasks([])
    setProjectName("")
  }

  // Get tickets by status
  function getTicketsByStatus(status: TicketStatus) {
    return selectedProject?.tickets.filter((t) => t.status === status) || []
  }

  // Get all tickets assigned to current user across all projects
  function getMyTickets() {
    return projects.flatMap((project) =>
      project.tickets
        .filter((ticket) => ticket.assignee === currentUser)
        .map((ticket) => ({ ...ticket, projectName: project.name, projectId: project.id })),
    )
  }

  // Get my tickets by status
  function getMyTicketsByStatus(status: TicketStatus) {
    return getMyTickets().filter((ticket) => ticket.status === status)
  }

  // Get status color
  function getStatusColor(status: TicketStatus) {
    const colors = {
      backlog: "bg-gray-100 text-gray-800",
      todo: "bg-blue-100 text-blue-800",
      "in-progress": "bg-yellow-100 text-yellow-800",
      done: "bg-green-100 text-green-800",
    }
    return colors[status]
  }

  // Get priority color
  function getPriorityColor(priority: string) {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-red-100 text-red-800",
    }
    return colors[priority as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  // Ticket Card Component
  function TicketCard({
    ticket,
    showProject = false,
  }: { ticket: GeneratedTicket & { projectName?: string; projectId?: string }; showProject?: boolean }) {
    return (
      <Card className="mb-3 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedTicket(ticket)}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-gray-500" />
              <h4 className="font-medium text-sm">{ticket.title}</h4>
            </div>
            <Badge className="bg-blue-100 text-blue-800" variant="secondary">
              {ticket.type}
            </Badge>
          </div>

          <p className="text-xs text-gray-600 mb-3">{ticket.description}</p>

          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-2 flex-wrap">
              <Badge className={getStatusColor(ticket.status)} variant="secondary">
                {ticket.status.replace("-", " ")}
              </Badge>
              {ticket.deadline && (
                <Badge variant="outline" className="text-xs">
                  Due: {ticket.deadline.toLocaleDateString()}
                </Badge>
              )}
              {showProject && ticket.projectName && (
                <Badge variant="outline" className="text-xs bg-purple-100 text-purple-800">
                  {ticket.projectName}
                </Badge>
              )}
            </div>
          </div>

          {ticket.assignee && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
              <Target className="w-3 h-3" />
              <span>Assigned to: {ticket.assignee}</span>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // Project Configuration Components
  function OrderSelectionStep() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Select Order</h3>
          <Select onValueChange={handleOrderSelection}>
            <SelectTrigger>
              <SelectValue placeholder="Choose an order..." />
            </SelectTrigger>
            <SelectContent>
              {sampleOrders.map((order) => (
                <SelectItem key={order.id} value={order.id}>
                  <div className="flex items-center justify-between w-full">
                    <span>{order.name}</span>
                    <Badge variant="outline" className="ml-2">
                      {order.orderItems.length} items
                    </Badge>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedOrder && (
          <div>
            <h4 className="font-medium mb-2">Order Items</h4>
            <div className="space-y-2">
              {selectedOrder.orderItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <span className="font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500 ml-2">({item.sku})</span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">{item.color}</Badge>
                    <Badge variant="outline">{item.quantity} units</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setShowCreateProject(false)}>
            Cancel
          </Button>
          <Button onClick={() => setConfigStep(2)} disabled={!selectedOrder}>
            Next: Configure Milestones
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  function MilestoneConfigStep() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Configure Milestones</h3>
          <p className="text-sm text-gray-600 mb-4">Configure how tickets should be generated for each milestone</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Milestone</TableHead>
              <TableHead>Ticket Level</TableHead>
              <TableHead>Grouping Field</TableHead>
              <TableHead>Deadline Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {milestoneConfigs.map((config) => (
              <TableRow key={config.milestoneId}>
                <TableCell className="font-medium">{config.milestoneName}</TableCell>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor={`switch-${config.milestoneId}`} className="text-sm">
                      {config.isOrderLevel ? "Order Level" : "Order Item Level"}
                    </Label>
                    <Switch
                      id={`switch-${config.milestoneId}`}
                      checked={!config.isOrderLevel}
                      onCheckedChange={(checked) =>
                        updateMilestoneConfig(config.milestoneId, { isOrderLevel: !checked })
                      }
                    />
                  </div>
                </TableCell>
                <TableCell>
                  {!config.isOrderLevel && (
                    <Select
                      value={config.groupingField || ""}
                      onValueChange={(value) => updateMilestoneConfig(config.milestoneId, { groupingField: value })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Group by..." />
                      </SelectTrigger>
                      <SelectContent>
                        {selectedOrder?.groupingFields.map((field: string) => (
                          <SelectItem key={field} value={field}>
                            {field.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </TableCell>
                <TableCell>
                  <div className="text-sm font-medium">
                    {new Date(Date.now() + config.deadlineDays * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setConfigStep(1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => {
              generateTicketsFromConfig()
              setConfigStep(3)
            }}
          >
            Next: Add Custom Tasks
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  function TaskCreationStep() {
    const [showTaskForm, setShowTaskForm] = useState(false)
    const [taskType, setTaskType] = useState<"linked" | "unlinked">("linked")
    const [taskForm, setTaskForm] = useState({
      name: "",
      description: "",
      assignee: "",
      deadline: "",
      linkedMilestoneId: "",
      offsetDays: 0,
      offsetType: "before" as "before" | "after",
    })

    function handleAddTask() {
      if (taskType === "linked") {
        addCustomTask({
          name: taskForm.name,
          description: taskForm.description,
          type: "linked",
          assignee: taskForm.assignee,
          linkedMilestoneId: taskForm.linkedMilestoneId,
          offsetDays: taskForm.offsetDays,
          offsetType: taskForm.offsetType,
        })
      } else {
        addCustomTask({
          name: taskForm.name,
          description: taskForm.description,
          type: "unlinked",
          assignee: taskForm.assignee,
          deadline: taskForm.deadline ? new Date(taskForm.deadline) : undefined,
        })
      }

      setTaskForm({
        name: "",
        description: "",
        assignee: "",
        deadline: "",
        linkedMilestoneId: "",
        offsetDays: 0,
        offsetType: "before",
      })
      setShowTaskForm(false)
      generateTicketsFromConfig() // Regenerate tickets with new custom tasks
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Generated Tickets & Custom Tasks</h3>
            <p className="text-sm text-gray-600">Review generated tickets and add custom tasks</p>
          </div>
          <Button onClick={() => setShowTaskForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Custom Task
          </Button>
        </div>

        {/* Generated Tickets List */}
        <div>
          <h4 className="font-medium mb-3">All Tickets ({generatedTickets.length})</h4>
          <div className="max-h-96 overflow-y-auto space-y-2">
            {generatedTickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{ticket.title}</div>
                  <div className="text-sm text-gray-600">{ticket.description}</div>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {ticket.type}
                    </Badge>
                    {ticket.deadline && (
                      <Badge variant="outline" className="text-xs">
                        Due: {ticket.deadline.toLocaleDateString()}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Custom Task Form Modal */}
        <Dialog open={showTaskForm} onOpenChange={setShowTaskForm}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Custom Task</DialogTitle>
            </DialogHeader>

            <Tabs value={taskType} onValueChange={(value) => setTaskType(value as "linked" | "unlinked")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="linked" className="flex items-center gap-2">
                  <Link className="w-4 h-4" />
                  Linked Task
                </TabsTrigger>
                <TabsTrigger value="unlinked" className="flex items-center gap-2">
                  <Unlink className="w-4 h-4" />
                  Unlinked Task
                </TabsTrigger>
              </TabsList>

              <TabsContent value="linked" className="space-y-4">
                <div>
                  <Label>Task Name</Label>
                  <Input
                    value={taskForm.name}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter task name..."
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description..."
                  />
                </div>
                <div>
                  <Label>Link to Milestone</Label>
                  <Select
                    value={taskForm.linkedMilestoneId}
                    onValueChange={(value) => setTaskForm((prev) => ({ ...prev, linkedMilestoneId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select milestone..." />
                    </SelectTrigger>
                    <SelectContent>
                      {milestoneConfigs.map((config) => (
                        <SelectItem key={config.milestoneId} value={config.milestoneId}>
                          {config.milestoneName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Days Offset</Label>
                    <Input
                      type="number"
                      value={taskForm.offsetDays}
                      onChange={(e) =>
                        setTaskForm((prev) => ({ ...prev, offsetDays: Number.parseInt(e.target.value) || 0 }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Before/After</Label>
                    <Select
                      value={taskForm.offsetType}
                      onValueChange={(value) =>
                        setTaskForm((prev) => ({ ...prev, offsetType: value as "before" | "after" }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="before">Before</SelectItem>
                        <SelectItem value="after">After</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Assignee</Label>
                  <Select
                    value={taskForm.assignee}
                    onValueChange={(value) => setTaskForm((prev) => ({ ...prev, assignee: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {systemUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{user.name}</span>
                            <span className="text-xs text-gray-500 ml-2">{user.role}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              <TabsContent value="unlinked" className="space-y-4">
                <div>
                  <Label>Task Name</Label>
                  <Input
                    value={taskForm.name}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter task name..."
                  />
                </div>
                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={taskForm.description}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, description: e.target.value }))}
                    placeholder="Enter task description..."
                  />
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm((prev) => ({ ...prev, deadline: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Assignee</Label>
                  <Select
                    value={taskForm.assignee}
                    onValueChange={(value) => setTaskForm((prev) => ({ ...prev, assignee: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {systemUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{user.name}</span>
                            <span className="text-xs text-gray-500 ml-2">{user.role}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleAddTask} className="flex-1">
                Add Task
              </Button>
              <Button variant="outline" onClick={() => setShowTaskForm(false)}>
                Cancel
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setConfigStep(2)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={() => setConfigStep(4)}>
            Next: Preview & Create
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    )
  }

  function PreviewStep() {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-4">Project Preview</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <Label>Project Name</Label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Enter project name..."
              />
            </div>
            <div>
              <Label>Order</Label>
              <Input value={selectedOrder?.name || ""} disabled />
            </div>
          </div>
        </div>

        {/* Gantt Chart Placeholder */}
        <div className="border rounded-lg p-6 bg-gray-50">
          <div className="flex items-center gap-2 mb-4">
            <Calendar className="w-5 h-5" />
            <h4 className="font-medium">Project Timeline</h4>
          </div>
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm">Gantt Chart will be displayed here</p>
              <p className="text-xs text-gray-400">Timeline visualization coming soon</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{generatedTickets.length}</div>
              <div className="text-sm text-gray-600">Total Tickets</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{milestoneConfigs.length}</div>
              <div className="text-sm text-gray-600">Milestones</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{customTasks.length}</div>
              <div className="text-sm text-gray-600">Custom Tasks</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setConfigStep(3)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={createProjectFromConfig}
            disabled={!projectName.trim()}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Create Project
          </Button>
        </div>
      </div>
    )
  }

  // Ticket Detail Modal Component
  function TicketDetailModal() {
    const [editedTicket, setEditedTicket] = useState<GeneratedTicket | null>(null)
    const [newFile, setNewFile] = useState<File | null>(null)

    useEffect(() => {
      if (selectedTicket) {
        setEditedTicket({ ...selectedTicket })
      }
    }, [selectedTicket])

    if (!selectedTicket || !editedTicket) return null

    const handleSave = () => {
      if (!selectedProject) return

      const updatedTickets = selectedProject.tickets.map((ticket) =>
        ticket.id === editedTicket.id ? editedTicket : ticket,
      )

      const updatedProject = { ...selectedProject, tickets: updatedTickets }
      setProjects((prev) => prev.map((p) => (p.id === selectedProject.id ? updatedProject : p)))
      setSelectedProject(updatedProject)
      setSelectedTicket(null)
    }

    const handleFieldChange = (fieldName: string, value: any) => {
      setEditedTicket((prev) => {
        if (!prev) return null
        return {
          ...prev,
          fields: prev.fields.map((field) => (field.name === fieldName ? { ...field, value } : field)),
        }
      })
    }

    const handleStatusChange = (newStatus: TicketStatus) => {
      setEditedTicket((prev) => (prev ? { ...prev, status: newStatus } : null))
    }

    return (
      <Dialog open={!!selectedTicket} onOpenChange={() => setSelectedTicket(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              {editedTicket.title}
              <Badge className="bg-blue-100 text-blue-800">{editedTicket.type}</Badge>
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <div className="space-y-6 p-1">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Title</Label>
                  <Input
                    value={editedTicket.title}
                    onChange={(e) => setEditedTicket((prev) => (prev ? { ...prev, title: e.target.value } : null))}
                  />
                </div>
                <div>
                  <Label>Status</Label>
                  <Select value={editedTicket.status} onValueChange={handleStatusChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="backlog">Backlog</SelectItem>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={editedTicket.description}
                  onChange={(e) => setEditedTicket((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Assignee</Label>
                  <Select
                    value={editedTicket.assignee || ""}
                    onValueChange={(value) => setEditedTicket((prev) => (prev ? { ...prev, assignee: value } : null))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select assignee..." />
                    </SelectTrigger>
                    <SelectContent>
                      {systemUsers.map((user) => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name} ({user.role})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Deadline</Label>
                  <Input
                    type="date"
                    value={editedTicket.deadline ? editedTicket.deadline.toISOString().split("T")[0] : ""}
                    onChange={(e) =>
                      setEditedTicket((prev) =>
                        prev ? { ...prev, deadline: e.target.value ? new Date(e.target.value) : undefined } : null,
                      )
                    }
                  />
                </div>
              </div>

              {/* Custom Fields */}
              {editedTicket.fields.length > 0 && (
                <div>
                  <h4 className="font-medium mb-3">Custom Fields</h4>
                  <div className="space-y-4">
                    {editedTicket.fields.map((field) => (
                      <div key={field.name}>
                        <Label className="flex items-center gap-2">
                          {field.label}
                          {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        {field.type === "text" && (
                          <Input
                            value={field.value || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            required={field.required}
                          />
                        )}
                        {field.type === "textarea" && (
                          <Textarea
                            value={field.value || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            required={field.required}
                            rows={3}
                          />
                        )}
                        {field.type === "number" && (
                          <Input
                            type="number"
                            value={field.value || ""}
                            onChange={(e) => handleFieldChange(field.name, e.target.value)}
                            required={field.required}
                          />
                        )}
                        {field.type === "select" && (
                          <Select
                            value={field.value || ""}
                            onValueChange={(value) => handleFieldChange(field.name, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select option..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="option1">Option 1</SelectItem>
                              <SelectItem value="option2">Option 2</SelectItem>
                              <SelectItem value="option3">Option 3</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                        {field.type === "file" && (
                          <div className="space-y-2">
                            <Input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) {
                                  setNewFile(file)
                                  handleFieldChange(field.name, file.name)
                                }
                              }}
                            />
                            {field.value && <div className="text-sm text-gray-600">Current: {field.value}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => setSelectedTicket(null)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  function selectProjectFromLanding(project: Project) {
    setSelectedProject(project)
    setShowLandingPage(false)
    setViewMode("project")
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {/* Header - Only show in Kanban view */}
        {!showLandingPage && (
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowLandingPage(true)
                  setSelectedProject(null)
                }}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Projects
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Project Management</h1>
                <p className="text-gray-600">Workflow-based ticket management system</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Project Selector */}
              {viewMode === "project" && (
                <Select
                  value={selectedProject?.id || ""}
                  onValueChange={(projectId) => {
                    const project = projects.find((p) => p.id === projectId)
                    setSelectedProject(project || null)
                    setShowLandingPage(false) // Hide landing page when project is selected
                  }}
                >
                  <SelectTrigger className="w-80">
                    <SelectValue placeholder="Select a project...">
                      {selectedProject ? (
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate">{selectedProject.name}</span>
                          <Badge variant="outline" className="text-xs ml-2">
                            {selectedProject.tickets.length} tickets
                          </Badge>
                        </div>
                      ) : (
                        "Select a project..."
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id}>
                        <div className="flex items-center justify-between w-full">
                          <span className="truncate mr-2">{project.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {project.tickets.length} tickets
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}

              {/* View Mode Toggle */}
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === "project" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("project")}
                >
                  Project View
                </Button>
                <Button
                  variant={viewMode === "my-tickets" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setViewMode("my-tickets")}
                >
                  My Tickets
                </Button>
              </div>

              <Button onClick={() => setShowCreateProject(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>
        )}

        {/* Landing Page Header - Only show on landing page */}
        {showLandingPage && (
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Projects Dashboard</h1>
              <p className="text-gray-600">Manage all your workflow projects</p>
            </div>
            <Button onClick={() => setShowCreateProject(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </div>
        )}

        {/* Landing Page */}
        {showLandingPage && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="w-6 h-6 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Projects</p>
                      <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Projects</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {projects.filter((p) => p.status === "active").length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">My Tasks</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {projects.reduce(
                          (acc, p) => acc + p.tickets.filter((t) => t.assignee === currentUser).length,
                          0,
                        )}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Archive className="w-6 h-6 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Tickets</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {projects.reduce((acc, p) => acc + p.tickets.length, 0)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Projects List */}
            <Card>
              <CardHeader>
                <CardTitle>All Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {projects.map((project) => {
                    const totalTickets = project.tickets.length
                    const completedTickets = project.tickets.filter((t) => t.status === "done").length
                    const inProgressTickets = project.tickets.filter((t) => t.status === "in-progress").length
                    const myTickets = project.tickets.filter((t) => t.assignee === currentUser).length
                    const completionPercentage =
                      totalTickets > 0 ? Math.round((completedTickets / totalTickets) * 100) : 0

                    return (
                      <div
                        key={project.id}
                        className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => selectProjectFromLanding(project)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                              <Badge
                                className={
                                  project.status === "active"
                                    ? "bg-green-100 text-green-800"
                                    : project.status === "completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : "bg-yellow-100 text-yellow-800"
                                }
                              >
                                {project.status}
                              </Badge>
                            </div>

                            <p className="text-sm text-gray-600 mb-4">
                              Created {project.createdAt.toLocaleDateString()} • Order ID: {project.orderId}
                            </p>

                            {/* Progress Bar */}
                            <div className="mb-4">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                <span className="text-sm text-gray-500">{completionPercentage}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${completionPercentage}%` }}
                                />
                              </div>
                            </div>

                            {/* Ticket Stats */}
                            <div className="flex items-center gap-6 text-sm">
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                                <span className="text-gray-600">{totalTickets} Total</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                <span className="text-gray-600">{inProgressTickets} In Progress</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                <span className="text-gray-600">{completedTickets} Completed</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Target className="w-3 h-3 text-purple-500" />
                                <span className="text-gray-600">{myTickets} Assigned to me</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Project Info */}
        {viewMode === "project" && selectedProject && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{selectedProject.name}</CardTitle>
                  <p className="text-sm text-gray-600">Created {selectedProject.createdAt.toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-green-100 text-green-800">{selectedProject.status}</Badge>
                  <Badge variant="outline">{selectedProject.tickets.length} total tickets</Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {viewMode === "my-tickets" && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    My Tickets
                  </CardTitle>
                  <p className="text-sm text-gray-600">All tickets assigned to {currentUser}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-blue-100 text-blue-800">{getMyTickets().length} total tickets</Badge>
                  <Badge variant="outline">{projects.length} projects</Badge>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Kanban Board */}
        {viewMode === "project" && selectedProject && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Backlog */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Archive className="w-5 h-5 text-gray-500" />
                <h3 className="font-semibold text-gray-700">Backlog</h3>
                <Badge variant="secondary">{getTicketsByStatus("backlog").length}</Badge>
              </div>
              <div className="space-y-3">
                {getTicketsByStatus("backlog").map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </div>

            {/* To Do */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-gray-700">To Do</h3>
                <Badge variant="secondary">{getTicketsByStatus("todo").length}</Badge>
              </div>
              <div className="space-y-3">
                {getTicketsByStatus("todo").map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Play className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-gray-700">In Progress</h3>
                <Badge variant="secondary">{getTicketsByStatus("in-progress").length}</Badge>
              </div>
              <div className="space-y-3">
                {getTicketsByStatus("in-progress").map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </div>

            {/* Done */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-gray-700">Done</h3>
                <Badge variant="secondary">{getTicketsByStatus("done").length}</Badge>
              </div>
              <div className="space-y-3">
                {getTicketsByStatus("done").map((ticket) => (
                  <TicketCard key={ticket.id} ticket={ticket} />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* My Tickets View */}
        {viewMode === "my-tickets" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {["backlog", "todo", "in-progress", "done"].map((status) => (
              <div key={status}>
                <div className="flex items-center gap-2 mb-4">
                  {status === "backlog" && <Archive className="w-5 h-5 text-gray-500" />}
                  {status === "todo" && <Clock className="w-5 h-5 text-blue-500" />}
                  {status === "in-progress" && <Play className="w-5 h-5 text-yellow-500" />}
                  {status === "done" && <CheckCircle className="w-5 h-5 text-green-500" />}
                  <h3 className="font-semibold text-gray-700 capitalize">{status.replace("-", " ")}</h3>
                  <Badge variant="secondary">{getMyTicketsByStatus(status as TicketStatus).length}</Badge>
                </div>
                <div className="space-y-3">
                  {getMyTicketsByStatus(status as TicketStatus).map((ticket) => (
                    <TicketCard key={ticket.id} ticket={ticket} showProject={true} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Project Selected */}
        {viewMode === "project" && !selectedProject && projects.length > 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Target className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Project</h3>
              <p className="text-gray-600 mb-4">Choose a project from the dropdown above to view its tickets</p>
            </CardContent>
          </Card>
        )}

        {/* No Projects */}
        {projects.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Projects Yet</h3>
              <p className="text-gray-600 mb-4">Create your first project to get started</p>
              <Button onClick={() => setShowCreateProject(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Project Configuration Modal */}
        <Dialog
          open={showCreateProject}
          onOpenChange={(open) => {
            if (!open) resetConfiguration()
            setShowCreateProject(open)
          }}
        >
          <DialogContent className="max-w-6xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Project Configuration
                <Badge variant="outline">Step {configStep} of 4</Badge>
              </DialogTitle>
            </DialogHeader>

            <ScrollArea className="max-h-[80vh]">
              <div className="p-1">
                {configStep === 1 && <OrderSelectionStep />}
                {configStep === 2 && <MilestoneConfigStep />}
                {configStep === 3 && <TaskCreationStep />}
                {configStep === 4 && <PreviewStep />}
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>

        {/* Ticket Detail Modal */}
        <TicketDetailModal />
      </div>
    </div>
  )
}
