/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Box as B, Button, Card, CardContent, makeStyles, Typography } from '@material-ui/core';
import React, { useEffect, useContext, useState, FC, Fragment } from 'react';
import LNSNode from '../components/LNSNode';
import UpdateReverseLookupDialog from '../components/transactions/UpdateReverseLookupDialog';
import AppContext from '../contexts/AppContext';
import UserContext from '../contexts/UserContext';
import MainLayout from '../layouts/MainLayout';
import { Account, LNSNodeJSON } from '../types';

const useStyles = makeStyles(() => ({
	cardContentArea: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'flex-end',
	},

	cardContentHeading: {
		flexGrow: 1,
	},
}));
const Box = B as any;
const MyAccount: FC = () => {
	const classes = useStyles();
	const { user, connected } = useContext(UserContext);
	const { client } = useContext(AppContext);
	const [myAccount, setMyAccount] = useState<any>(undefined);
	const [myNodes, setMyNodes] = useState<LNSNodeJSON[]>([]);
	const [reverseNode, setReverseNode] = useState<LNSNodeJSON | undefined>(undefined);
	const [updateReverseNameDialog, setUpdateReverseNameDialog] = useState(false);
	const run = async () => {
		try {
			const acc = ((await client.account.get(
				Buffer.from(user.address, 'hex'),
			)) as unknown) as Account;
			// console.log(acc, 'kl;');
			// setMyAccount(acc);
			if (acc.lns) {
				for (const nodeHash of acc.lns.ownNodes) {
					const node = await client.invoke<LNSNodeJSON>('lns:resolveNode', {
						node: nodeHash.toString('hex'),
					});
					// console.log(node);
					// setMyNodes(currentNodes => [...currentNodes, node]);
				}
				if (acc.lns.reverseLookup) {
					const node = await client.invoke<LNSNodeJSON>('lns:resolveNode', {
						node: acc.lns.reverseLookup.toString('hex'),
					});
					// setReverseNode(node);
				}
			}
		} catch (e) {
			console.error(e);
		}
	};
	useEffect(() => {
		if (client) {
			// console.log('jkhjk');
			run();
		}
	}, [client, connected]);

	return (
		<MainLayout>
			{connected && myAccount && (
				<Fragment>
					<Box mt={2} mb={2} className={classes.cardContentArea}>
						<Typography variant={'h4'} className={classes.cardContentHeading}>
							My Domains
						</Typography>

						<div>
							<Button
								variant={'outlined'}
								color={'primary'}
								onClick={() => setUpdateReverseNameDialog(true)}
							>
								Update Reverse Lookup
							</Button>

							<UpdateReverseLookupDialog
								open={updateReverseNameDialog}
								existingName={reverseNode ? reverseNode.name : ''}
								newNames={myNodes.map(n => n.name)}
								maxWidth={'sm'}
								fullWidth={true}
							/>
						</div>
					</Box>

					<Box mt={2} mb={2}>
						<Card>
							<CardContent>
								<pre>{JSON.stringify(client.account.toJSON(myAccount as never))}</pre>
							</CardContent>
						</Card>
					</Box>

					{myNodes.map(n => (
						<LNSNode key={n.name} node={n} />
					))}
				</Fragment>
			)}
		</MainLayout>
	);
};

export default MyAccount;
