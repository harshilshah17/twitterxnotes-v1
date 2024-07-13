// src/Home.js
import React, { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Button, TextField, List, ListItem, IconButton, Box, Typography, Card, CardContent, Avatar } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { deepPurple } from '@mui/material/colors';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotes = async () => {
      const querySnapshot = await getDocs(collection(db, 'notes'));
      setNotes(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    };

    fetchNotes();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (!user) {
        navigate('/');
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleAddNote = async () => {
    if (newNote.trim()) {
      await addDoc(collection(db, 'notes'), { text: newNote, completed: false, likes: 0 });
      setNewNote('');
      const querySnapshot = await getDocs(collection(db, 'notes'));
      setNotes(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }
  };

  const handleEditNote = async (id, newText) => {
    const noteDoc = doc(db, 'notes', id);
    await updateDoc(noteDoc, { text: newText });
    const querySnapshot = await getDocs(collection(db, 'notes'));
    setNotes(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  const handleDeleteNote = async (id) => {
    const noteDoc = doc(db, 'notes', id);
    await deleteDoc(noteDoc);
    const querySnapshot = await getDocs(collection(db, 'notes'));
    setNotes(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  const handleUpvoteNote = async (id, currentLikes) => {
    const noteDoc = doc(db, 'notes', id);
    await updateDoc(noteDoc, { likes: currentLikes + 1 });
    const querySnapshot = await getDocs(collection(db, 'notes'));
    setNotes(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  const handleMarkAsCompleted = async (id, completed) => {
    const noteDoc = doc(db, 'notes', id);
    await updateDoc(noteDoc, { completed: !completed });
    const querySnapshot = await getDocs(collection(db, 'notes'));
    setNotes(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  return (
    <Box sx={{ textAlign: 'center', mt: 5 }}>
      <Typography variant="h4" gutterBottom>Notes</Typography>
      <Button onClick={() => signOut(auth)} variant="contained" color="secondary">Sign Out</Button>
      <Box sx={{ mt: 2 }}>
        <TextField
          label="New Note"
          fullWidth
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
        />
        <Button onClick={handleAddNote} variant="contained" color="primary" sx={{ mt: 1 }}>Add Note</Button>
      </Box>
      <List sx={{ mt: 2 }}>
        {notes.map(note => (
          <Card key={note.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: deepPurple[500], mr: 2 }}>U</Avatar>
              <Box sx={{ flexGrow: 1 }}>
                <TextField
                  value={note.text}
                  onChange={(e) => handleEditNote(note.id, e.target.value)}
                  fullWidth
                  multiline
                  variant="standard"
                />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                  <Box>
                    <IconButton onClick={() => handleUpvoteNote(note.id, note.likes)}>
                      <ThumbUpIcon />
                    </IconButton>
                    <Typography variant="body2" display="inline">{note.likes}</Typography>
                  </Box>
                  <Box>
                    <IconButton onClick={() => handleMarkAsCompleted(note.id, note.completed)}>
                      <CheckCircleIcon color={note.completed ? "success" : "disabled"} />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteNote(note.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </List>
    </Box>
  );
};

export default Home;
