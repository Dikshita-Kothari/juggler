import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...')

  // Clear existing data (Deletion in correct order)
  await prisma.taskHistory.deleteMany({})
  await prisma.taskComment.deleteMany({})
  await prisma.task.deleteMany({})
  await prisma.projectMember.deleteMany({})
  await prisma.project.deleteMany({})
  await prisma.account.deleteMany({})
  await prisma.session.deleteMany({})
  await prisma.user.deleteMany({})

  // 1. Create Users (with String IDs for NextAuth)
  const user1 = await prisma.user.create({
    data: { id: "cm0000001", name: "Alex Admin", username: "alex", email: "alex@juggler.app", password: "password123", avatar_color: "bg-blue-500" }
  })
  const user2 = await prisma.user.create({
    data: { id: "cm0000002", name: "Sarah Dev", username: "sarah", email: "sarah@juggler.app", password: "password123", avatar_color: "bg-emerald-500" }
  })

  // 2. Create Projects
  const project1 = await prisma.project.create({
    data: {
      p_id: 1,
      u_id: user1.id,
      name: "Juggler App V1",
      description: "Launch the MVP of the new todo app.",
      deadline: new Date("2024-03-15"),
    }
  })

  // 3. Create Project Memberships
  await prisma.projectMember.createMany({
    data: [
      { p_id: 1, u_id: user1.id, role: 'OWNER' },
      { p_id: 1, u_id: user2.id, role: 'MEMBER' },
    ]
  })

  // 4. Create Tasks
  const task1 = await prisma.task.create({
    data: {
      t_id: 1, p_id: 1, name: "Design Database Schema", description: "Create SQL tables for users, projects, and tasks.", position: 1, status: "DONE", priority: "HIGH", deadline: new Date("2024-02-05")
    }
  })

  // 5. Create Comments
  await prisma.taskComment.create({
    data: { comment_id: 1, t_id: 1, u_id: user2.id, comment_text: "Mocked comment for testing." }
  })

  // 6. Create Task History
  await prisma.taskHistory.create({
    data: { history_id: 1, t_id: 1, p_id: 1, changed_by: user1.id, action_type: "STATUS_CHANGE", old_value: "IN_PROGRESS", new_value: "DONE" }
  })

  console.log('Seeding finished.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
