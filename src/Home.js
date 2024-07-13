// src/Home.js
import React, { useState, useEffect } from 'react';
import { db, auth, storage } from './firebase';
import { collection, addDoc, getDocs, updateDoc, doc } from 'firebase/firestore';
import { onAuthStateChanged, signOut, updateProfile } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, TextField, List, IconButton, Box, Typography, Card, CardContent, Avatar, Grid } from '@mui/material';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import { deepPurple } from '@mui/material/colors';

const Home = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
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

  return (
    <Box sx={{ textAlign: 'center', mt: 5 }}>
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
      <Button onClick={() => signOut(auth)} variant="contained" color="secondary">Sign Out</Button>
      <Grid container spacing={2} sx={{ mt: 2, alignItems: 'center', justifyContent: 'center' }}>
        <Grid item>
          {user && (
            <Avatar
              src={user.photoURL}
              sx={{ bgcolor: deepPurple[500] }}
            />
          )}
        </Grid>
        <Grid item xs={8}>
          <TextField
            label="What's happening?"
            fullWidth
            multiline
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
          />
        </Grid>
        <Grid item>
          <Button onClick={handleAddNote} variant="contained" color="primary">Post</Button>
        </Grid>
      </Grid>
      <List sx={{ mt: 2 }}>
        {notes.map(note => (
          <Card key={note.id} variant="outlined" sx={{ mb: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar src={note.userPhotoURL} sx={{ bgcolor: deepPurple[500], mr: 2 }} />
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
