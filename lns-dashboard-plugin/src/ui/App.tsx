/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */
import { apiClient } from '@liskhq/lisk-client';
import { CssBaseline } from '@material-ui/core';
import * as React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import AppContext, { AppState } from './contexts/AppContext';
import BlocksContext from './contexts/BlocksContext';
import EventEmitterContext, {
	NEW_BLOCK_EVENT,
	NEW_CONFIRMED_TX_EVENT,
} from './contexts/EventEmitterContext';
import { NetworkContextProvider } from './contexts/NetworkContext';
import TransactionsContext from './contexts/TransactionsContext';
import UserContext, { userDefaultValue } from './contexts/UserContext';
import './index.scss';
import MainPage from './pages/MainPage';
import MyAccount from './pages/MyAccount';
import SearchPage from './pages/SearchPage';
import { Block, Transaction, User } from './types';
import { getAppConfig } from './utils';
import useStateWithLocalStorage from './utils/useStateWithLocalStorage';

const App: React.FC = () => {
	const clientRef = React.useRef<apiClient.APIClient>();
	const [appState, setAppState] = React.useState<AppState>({ ready: false, enableLNSNames: true });
	const [user, setUser] = useStateWithLocalStorage<User>('currentUser', userDefaultValue);
	const [connected, setConnected] = React.useState(user.address !== '');
	const [transactions, setTransactions] = useStateWithLocalStorage<Transaction[]>(
		'recentTransactions',
		[],
	);
	const [blocks, setBlocks] = React.useState<Block[]>([]);
	const eventObserver = React.useContext(EventEmitterContext);

	React.useEffect(() => {
		const fetchConfig = async () => {
			const config = await getAppConfig();
			try {
				const c = await apiClient.createWSClient(config.applicationUrl);
				clientRef.current = c;
				setAppState({ ...appState, ready: true });
			} catch (error) {
				console.error('Can not connect to Lisk Name Service Node', error);
			}
		};

		if (!appState.ready) {
			fetchConfig().catch(console.error);
		}
	}, []);

	React.useEffect(() => {
		if (!clientRef.current) {
			return;
		}

		clientRef.current.subscribe('app:block:new', handleBlockUpdate);
		clientRef.current.subscribe('app:transaction:new', handleTransactionUpdate);
	}, [appState.ready]);

	const handleTransactionUpdate = React.useCallback(
		(event: Record<string, unknown> | undefined) => {
			const client = clientRef.current;

			const data = event as { transaction: string };

			const transaction = client?.transaction.decode(data.transaction);

			// 	console.log(transaction);
			// eventObserver.emit(NEW_BLOCK_EVENT, block);

			// for (const tx of block.payload) {
			// 	eventObserver.emit(NEW_CONFIRMED_TX_EVENT, tx);
			// }

			if (transaction) {
				const _asset = transaction.asset as any;
				const asset = {
					..._asset,
					recipientAddress: Buffer.from(_asset.recipientAddress as string).toString('hex'),
				};
				const tx = {
					id: Buffer.from(transaction.id as string).toString('hex'),
					senderPublicKey: Buffer.from(transaction.senderPublicKey as string).toString('hex'),
					moduleID: transaction.moduleID,
					assetID: transaction.assetID,
					fee: transaction.fee,
					asset,
				};
				setTransactions(trxs => [tx, ...trxs] as any);
			}
		},
		[clientRef.current],
	);

	const handleBlockUpdate = React.useCallback(
		(event: Record<string, unknown> | undefined) => {
			const client = clientRef.current;

			const data = event as { block: string; accounts: string[] };

			const block = (client?.block.toJSON(
				client?.block.decode(Buffer.from(data.block)),
			) as unknown) as Block;
			// eventObserver.emit(NEW_BLOCK_EVENT, block);

			// for (const tx of block.payload) {
			// 	eventObserver.emit(NEW_CONFIRMED_TX_EVENT, tx);
			// }
			setBlocks(blks => [block, ...blks]);

			setTransactions(trxs => [...block.payload, ...trxs]);
		},
		[clientRef.current],
	);

	const setUserHandler = (u?: User): void => {
		if (u) {
			setUser(u);
			setConnected(true);
		} else {
			setUser(userDefaultValue);
			setConnected(false);
		}
	};

	return (
		<React.Fragment>
			<CssBaseline />
			<AppContext.Provider
				value={{
					appState,
					setAppState,
					client: clientRef.current as apiClient.APIClient,
				}}
			>
				<UserContext.Provider value={{ connected, user, setUser: setUserHandler }}>
					<NetworkContextProvider>
						<BlocksContext.Provider value={blocks}>
							<TransactionsContext.Provider value={transactions}>
								<Router>
									<Switch>
										<Route path="/" exact>
											<MainPage />
										</Route>
										<Route path="/search/:term">
											<SearchPage />
										</Route>
										<Route path="/profile">
											<MyAccount />
										</Route>
									</Switch>
								</Router>
							</TransactionsContext.Provider>
						</BlocksContext.Provider>
					</NetworkContextProvider>
				</UserContext.Provider>
			</AppContext.Provider>
		</React.Fragment>
	);
};

export default App;
