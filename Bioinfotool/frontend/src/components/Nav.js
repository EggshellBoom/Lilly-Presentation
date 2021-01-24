import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import Button from "@material-ui/core/Button";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { NavLink } from "react-router-dom";

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
}));

export default function ButtonAppBar(props) {
  const classes = useStyles();

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div className={classes.root}>
      <AppBar position="fixed">
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
          >
            <MenuIcon aria-controls="simple-menu" onClick={handleClick} />
            <Menu
              id="simple-menu"
              anchorEl={anchorEl}
              keepMounted
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleClose}>
                <NavLink to="/">Home</NavLink>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <NavLink to="/entry">Data Entry</NavLink>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <NavLink to="/phylogeny">Phylogenetic Tree</NavLink>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <NavLink to="/alignment">Sequence Alignment</NavLink>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <NavLink to="/analysis">Data Analysis</NavLink>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <NavLink to="/cancer">Cancer Prediction</NavLink>
              </MenuItem>
              <MenuItem onClick={handleClose}>
                <a href="http://eggshellboom.github.io/Sequence-Alignment-Tutorial/">Sequence Alignment Tutorial</a>
              </MenuItem>
            </Menu>
          </IconButton>

          <Typography variant="h6" className={classes.title}>
            Bioinformatics Toolset
          </Typography>
          <Typography variant="h6" className={classes.title}>
            {props.title}
          </Typography>
          <Typography color="inherit">Implemented by Tanzhen Li</Typography>
        </Toolbar>
      </AppBar>
    </div>
  );
}
