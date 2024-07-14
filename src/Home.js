// src/Home.js
import React, { useState, useEffect } from 'react';
import { db, auth, storage } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, TextField, List, IconButton, Box, Typography, Card, CardContent, Avatar, Grid, Container, Paper, Checkbox } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import DeleteIcon from '@mui/icons-material/Delete';
import { deepPurple } from '@mui/material/colors';
import Lottie from 'react-lottie';
import animationData from './bluebird.json';
import jsPDF from 'jspdf';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [selectedNotes, setSelectedNotes] = useState([]);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

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
      } else {
        setUser(user);
      }
    });
    return unsubscribe;
  }, [navigate]);

  const handleAddNote = async () => {
    if (newNote.trim()) {
      await addDoc(collection(db, 'notes'), {
        text: newNote,
        completed: false,
        likes: 0,
        userPhotoURL: user.photoURL // Store the user's photo URL with the note
      });
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

  const handleUpvoteNote = async (id, currentLikes) => {
    const noteDoc = doc(db, 'notes', id);
    await updateDoc(noteDoc, { likes: currentLikes + 1 });
    const querySnapshot = await getDocs(collection(db, 'notes'));
    setNotes(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
  };

  const handleProfilePicChange = async (event) => {
    const file = event.target.files[0];
    if (file && user) {
      try {
        const profilePicRef = ref(storage, `profilePics/${user.uid}`);
        await uploadBytes(profilePicRef, file);
        const profilePicUrl = await getDownloadURL(profilePicRef);
        await updateProfile(user, { photoURL: profilePicUrl });
        await updateDoc(doc(db, 'users', user.uid), { profilePicUrl });
        setUser({ ...user, photoURL: profilePicUrl });
      } catch (error) {
        console.error("Error updating profile picture: ", error);
      }
    }
  };

  const handleSelectNote = (id) => {
    setSelectedNotes(prevSelectedNotes =>
      prevSelectedNotes.includes(id)
        ? prevSelectedNotes.filter(noteId => noteId !== id)
        : [...prevSelectedNotes, id]
    );
  };

  const handleSelectAllNotes = () => {
    if (selectedNotes.length === notes.length) {
      setSelectedNotes([]);
    } else {
      setSelectedNotes(notes.map(note => note.id));
    }
  };

  const handleDeleteSelectedNotes = async () => {
    for (const id of selectedNotes) {
      await deleteDoc(doc(db, 'notes', id));
    }
    const querySnapshot = await getDocs(collection(db, 'notes'));
    setNotes(querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    setSelectedNotes([]);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    let yPosition = 10;
    notes.forEach(note => {
      doc.text(note.text, 10, yPosition);
      yPosition += 10;
    });
    doc.save('notes.pdf');
  };

  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid slice'
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Lottie options={defaultOptions} height={200} width={200} />
      <Paper elevation={3} sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>Notes</Typography>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
            <label htmlFor="profile-pic-upload">
              <input
                type="file"
                id="profile-pic-upload"
                style={{ display: 'none' }}
                onChange={handleProfilePicChange}
              />
              <Avatar
                src={user.photoURL}
                sx={{ bgcolor: deepPurple[500], mr: 2, cursor: 'pointer' }}
                onClick={() => document.getElementById('profile-pic-upload').click()}
              />
            </label>
            <Typography variant="h6">{user.email}</Typography>
          </Box>
        )}
        <Button onClick={() => signOut(auth)} variant="contained" color="secondary" sx={{ mb: 3 }}>Sign Out</Button>
        <Box sx={{ mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f9f9f9' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              {user && (
                <Avatar
                  src={user.photoURL}
                  sx={{ bgcolor: deepPurple[500] }}
                />
              )}
            </Grid>
            <Grid item xs>
              <TextField
                placeholder="What's happening?"
                fullWidth
                multiline
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                variant="outlined"
                InputProps={{ style: { borderRadius: '25px' } }}
              />
            </Grid>
            <Grid item>
              <Button onClick={handleAddNote} variant="contained" color="primary" sx={{ borderRadius: '25px' }}>Post</Button>
            </Grid>
          </Grid>
        </Box>
        <List>
          {notes.map(note => (
            <Card key={note.id} variant="outlined" sx={{ mb: 2, borderRadius: '16px', boxShadow: 3 }}>
              <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
                <Checkbox
                  checked={selectedNotes.includes(note.id)}
                  onChange={() => handleSelectNote(note.id)}
                />
                <Avatar src={note.userPhotoURL} sx={{ bgcolor: deepPurple[500], mr: 2 }} />
                <Box sx={{ flexGrow: 1 }}>
                  <TextField
                    value={note.text}
                    onChange={(e) => handleEditNote(note.id, e.target.value)}
                    fullWidth
                    multiline
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    sx={{ '& .MuiInputBase-root': { fontSize: '1rem' } }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton onClick={() => handleUpvoteNote(note.id, note.likes)}>
                        <ThumbUpIcon />
                      </IconButton>
                      <Typography variant="body2" display="inline">{note.likes}</Typography>
                    </Box>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))}
        </List>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleSelectAllNotes}
            sx={{ borderRadius: '25px' }}
          >
            {selectedNotes.length === notes.length ? 'Deselect All' : 'Select All'}
          </Button>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDeleteSelectedNotes}
            sx={{ borderRadius: '25px' }}
            startIcon={<DeleteIcon />}
            disabled={selectedNotes.length === 0}
          >
            Delete All
          </Button>
        </Box>
        <Box sx={{ mt: 3 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleExportPDF}
            sx={{ borderRadius: '25px' }}
          >
            Export All as PDF
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default Home;
