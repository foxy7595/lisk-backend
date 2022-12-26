import { Box, Container, Grid, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import * as React from 'react';
import RecentBlocks from '../components/RecentBlocks';
import RecentTransactions from '../components/RecentTransactions';
import SearchBar from '../components/SearchBar';
import MainLayout from '../layouts/MainLayout';

const useStyles = makeStyles(theme => ({
	paper: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
	},
	avatar: {
		margin: theme.spacing(1),
		backgroundColor: theme.palette.secondary.main,
	},
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
}));

const MainPage: React.FC = () => {
	const classes = useStyles();

	return (
		<MainLayout disableSearch={true}>
			<br />
			<br />
			<Grid container spacing={3}>
				<Grid item xs={6}>
					<RecentTransactions />
				</Grid>
				<Grid item xs={6}>
					<RecentBlocks />
				</Grid>
			</Grid>
		</MainLayout>
	);
};

export default MainPage;
