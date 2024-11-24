// React JS

import React from 'react';
import { useState, useEffect } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import { CardActionArea, CardMedia, Grid, TableContainer, Table, TableBody, TableHead } from '@material-ui/core';
import cblogo from './cblogo.PNG';
import image from './bg.png';
import { common } from '@material-ui/core/colors';
import axios from 'axios';
import Container from '@material-ui/core/Container';
import { DropzoneArea } from 'material-ui-dropzone';




const ColorButton = withStyles((theme) => ({
    root: {
        color: theme.palette.getContrastText(common.white),
        backgroundColor: common.white,
        '&:hover': {
            backgroundColor: '#ffffff7a',
        },
    },
}))(Button);

const useStyles = makeStyles((theme) => ({
    grow: {
        flexGrow: 1,
    },
    clearButton: {
        width: '-webkit-fill-available',
        borderRadius: '15px',
        padding: '15px 22px',
        color: '#000000a6',
        fontSize: '20px',
        fontWeight: 900,
    },
    root: {
        maxWidth: 345,
        flexGrow: 1,
    },
    media: {
        height: 400,
    },
    paper: {
        padding: theme.spacing(2),
        margin: 'auto',
        maxWidth: 500,
    },
    gridContainer: {
        justifyContent: 'center',
        padding: '4em 1em 0 1em',
    },
    mainContainer: {
        backgroundImage: `url(${image})`,
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        height: '93vh',
        marginTop: '8px',
    },
    imageCard: {
        margin: 'auto',
        maxWidth: 400,
        height: 500,
        backgroundColor: 'transparent',
        boxShadow: '0px 9px 70px 0px rgb(0 0 0 / 30%) !important',
        borderRadius: '15px',
    },
    imageCardEmpty: {
        height: 'auto',
    },
    noImage: {
        margin: 'auto',
        width: 400,
        height: '400 !important',
    },
    input: {
        display: 'none',
    },
    uploadIcon: {
        background: 'white',
    },
    tableContainer: {
        backgroundColor: 'transparent !important',
        boxShadow: 'none !important',
    },
    table: {
        backgroundColor: 'transparent !important',
    },
    tableHead: {
        backgroundColor: 'transparent !important',
    },
    tableRow: {
        backgroundColor: 'transparent !important',
    },
    tableCell: {
        fontSize: '22px',
        backgroundColor: 'transparent !important',
        borderColor: 'transparent !important',
        color: '#000000a6 !important',
        fontWeight: 'bolder',
        padding: '1px 24px 1px 16px',
    },
    tableCell1: {
        fontSize: '14px',
        backgroundColor: 'transparent !important',
        borderColor: 'transparent !important',
        color: '#000000a6 !important',
        fontWeight: 'bolder',
        padding: '1px 24px 1px 16px',
    },
    tableBody: {
        backgroundColor: 'transparent !important',
    },
    text: {
        color: 'white !important',
        textAlign: 'center',
    },
    buttonGrid: {
        maxWidth: '416px',
        width: '100%',
    },
    detail: {
        backgroundColor: 'white',
        display: 'flex',
        justifyContent: 'center',
        flexDirection: 'column',
        alignItems: 'center',
    },
    appbar: {
        background: '#be6a77',
        boxShadow: 'none',
        color: 'white',
    },
    loader: {
        color: '3be6a77 !important',
    },
}));

export const ImageUpload = () => {
  const classes = useStyles();
  const [selectedFile, setSelectedFile] = useState();
  const [preview, setPreview] = useState();
  const [data, setData] = useState();
  const [image, setImage] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  let confidence = 0;

  const sendFile = async () => {
    if (image) {
      const formData = new FormData();
      formData.append('file', selectedFile);
      try {
        const res = await axios.post(process.env.REACT_APP_API_URL, formData);
        if (res.status === 200) {
          setData(res.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearData = () => {
    setData(null);
    setImage(false);
    setSelectedFile(null);
    setPreview(null);
  };

  useEffect(() => {
    if (!selectedFile) {
      setPreview(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreview(objectUrl);

    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  useEffect(() => {
    if (!preview) return;
    setIsLoading(true);
    sendFile();
  }, [preview]);

  const onSelectFile = (files) => {
    if (!files || files.length === 0) {
      setSelectedFile(undefined);
      setImage(false);
      setData(undefined);
      return;
    }
    setSelectedFile(files[0]);
    setData(undefined);
    setImage(true);
  };

  if (data) {
    confidence = (parseFloat(data.confidence) * 100).toFixed(2);
  }

  return (
    <React.Fragment>
      <AppBar position="static" className={classes.appbar}>
        <Toolbar>
          <Typography variant="h6" noWrap>
            Potato Disease Classification
          </Typography>
          <div className={classes.grow} />
          <Avatar src={cblogo} />
        </Toolbar>
      </AppBar>
      <Container maxWidth={false} className={classes.mainContainer} disableGutters>
        <Grid container justifyContent="center" alignItems="center" spacing={2}>
          <Grid item xs={12}>
            <Card
              className={`${classes.imageCard} ${!image ? classes.imageCardEmpty : ''}`}
            >
              {image ? (
                <CardActionArea>
                  <CardMedia
                    className={classes.media}
                    image={preview}
                    component="img"
                    title="Potato Leaf"
                  />
                </CardActionArea>
              ) : (
                <CardContent>
                  <DropzoneArea
                    acceptedFiles={['image/*']}
                    dropzoneText="Drag and drop an image of a potato plant leaf to process"
                    onChange={onSelectFile}
                  />
                </CardContent>
              )}
              {data && (
                <CardContent>
                  <TableContainer>
                    <Table size="small" aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <TableCell className={classes.tableCell1}>Label:</TableCell>
                          <TableCell align="right" className={classes.tableCell1}>
                            Confidence:
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        <TableRow>
                          <TableCell className={classes.tableCell}>
                            {data.class}
                          </TableCell>
                          <TableCell align="right" className={classes.tableCell}>
                            {confidence}%
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              )}
              {isLoading && (
                <CardContent>
                  <CircularProgress color="secondary" className={classes.loader} />
                  <Typography variant="h6" noWrap>
                    Processing
                  </Typography>
                </CardContent>
              )}
            </Card>
          </Grid>
          {data && (
            <Grid item>
              <ColorButton
                variant="contained"
                className={classes.clearButton}
                onClick={clearData}
              >
                Clear
              </ColorButton>
            </Grid>
          )}
        </Grid>
      </Container>
    </React.Fragment>
  );
};
