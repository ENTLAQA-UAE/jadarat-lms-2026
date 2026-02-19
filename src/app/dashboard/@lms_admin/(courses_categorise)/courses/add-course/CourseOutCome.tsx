import React, { useState, KeyboardEvent } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, X, Edit, Plus, Save } from 'lucide-react'

export interface LearningOutcome {
 id: string;
 text: string;
}

interface CourseOutcomeProps {
 outcomes: LearningOutcome[];
 setOutcomes: React.Dispatch<React.SetStateAction<LearningOutcome[]>>;
}

export function CourseOutcome({ outcomes, setOutcomes }: CourseOutcomeProps) {
 const [newOutcome, setNewOutcome] = useState("")
 const [editingId, setEditingId] = useState<string | null>(null)
 const [editingText, setEditingText] = useState("")
 const [localOutcomes, setLocalOutcomes] = useState(outcomes)
 const [nextId, setNextId] = useState(outcomes.length + 1)

 const addOutcome = () => {
  if (newOutcome.trim() !== "") {
   const updatedOutcomes = [...localOutcomes, { id: nextId.toString(), text: newOutcome }]
   setLocalOutcomes(updatedOutcomes)
   setOutcomes(updatedOutcomes)
   setNewOutcome("")
   setNextId(nextId + 1)
  }
 }

 const handleNewOutcomeKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
   e.preventDefault()
   addOutcome()
  }
 }

 const startEditing = (id: string) => {
  setEditingId(id)
  const outcomeToEdit = localOutcomes.find(outcome => outcome.id === id)
  setEditingText(outcomeToEdit?.text || "")
 }

 const saveEdit = () => {
  if (editingId !== null && editingText.trim() !== "") {
   const updatedOutcomes = localOutcomes.map(outcome =>
    outcome.id === editingId ? { ...outcome, text: editingText } : outcome
   )
   setLocalOutcomes(updatedOutcomes)
   setOutcomes(updatedOutcomes)
   setEditingId(null)
   setEditingText("")
  }
 }

 const handleEditKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter') {
   e.preventDefault()
   saveEdit()
  }
 }

 const cancelEdit = () => {
  setEditingId(null)
  setEditingText("")
 }

 const removeOutcome = (id: string) => {
  const updatedOutcomes = localOutcomes.filter(outcome => outcome.id !== id)
  setLocalOutcomes(updatedOutcomes)
  setOutcomes(updatedOutcomes)
 }

 return (
  <div className="mt-4">
   <p className="text-sm font-medium *">What you&apos;ll learn</p>
   <div className="space-y-4">
    {localOutcomes.map((outcome) => (
     <div key={outcome.id} className="flex items-start space-x-2 bg-gray-50 p-3 rounded-lg">
      <Check className="w-5 h-5 mt-1 text-green-500 flex-shrink-0" />
      <div className="flex-grow">
       {editingId === outcome.id ? (
        <Input
         value={editingText}
         onChange={(e) => setEditingText(e.target.value)}
         onKeyPress={handleEditKeyPress}
         className="mb-2"
        />
       ) : (
        <p>{outcome.text}</p>
       )}
      </div>
      <div className="flex space-x-2 ml-2">
       {editingId === outcome.id ? (
        <>
         <Button onClick={saveEdit} type='button' size="icon" variant="ghost">
          <Save className="w-4 h-4" />
         </Button>
         <Button onClick={cancelEdit} type='button' size="icon" variant="ghost">
          <X className="w-4 h-4" />
         </Button>
        </>
       ) : (
        <>
         <Button onClick={() => startEditing(outcome.id)} type='button' size="icon" variant="ghost">
          <Edit className="w-4 h-4" />
         </Button>
         <Button onClick={() => removeOutcome(outcome.id)} type='button' size="icon" variant="ghost" className="text-red-500">
          <X className="w-4 h-4" />
         </Button>
        </>
       )}
      </div>
     </div>
    ))}
   </div>
   <div className="mt-6 flex space-x-2">
    <Input
     value={newOutcome}
     onChange={(e) => setNewOutcome(e.target.value)}
     onKeyPress={handleNewOutcomeKeyPress}
     placeholder="Add a new learning outcome"
     className="flex-grow"
    />
    <Button type='button' onClick={addOutcome}>
     <Plus className="w-4 h-4 mr-1" />
     Add
    </Button>
   </div>
  </div>
 )
}