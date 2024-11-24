import React from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card'
import AvatarCircles from './ui/avatar-circles'
import { Badge } from './ui/badge'
import { Button } from './ui/button'

const TaskCard = () => {
    const avatars = [
        {
          imageUrl: "https://avatars.githubusercontent.com/u/16860528",
          profileUrl: "https://github.com/dillionverma",
        },
        {
          imageUrl: "https://avatars.githubusercontent.com/u/20110627",
          profileUrl: "https://github.com/tomonarifeehan",
        }]
  return (
    <Card className="w-[270px] ">
  <CardHeader>
    <CardTitle>Task Number</CardTitle>
    <CardDescription>Task Name</CardDescription>
  </CardHeader>
  
  <CardContent>
    <div className="flex items-center space-x-2">
      <h3 className="text-sm font-medium">Assigned to</h3>
      <AvatarCircles avatarUrls={avatars} />
    </div>  </CardContent>
  
  <CardFooter className="flex justify-between items-center">
    <Button>Go to Task</Button>
    <Badge className='bg-orange-400 hover:bg-orange-600' >Active</Badge>

  </CardFooter>
</Card> 
  )
}

export default TaskCard
