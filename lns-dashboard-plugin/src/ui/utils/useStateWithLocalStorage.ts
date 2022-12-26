/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as React from 'react';

const useStateWithLocalStorage = <T>(
	localStorageKey: string,
	defaultValue?: T,
): [T, React.Dispatch<React.SetStateAction<T>>] => {
	const exitingKey = localStorage.getItem(localStorageKey);

	const [value, setValue] = React.useState<T>(
		exitingKey === null ? defaultValue : JSON.parse(exitingKey),
	);

	React.useEffect(() => {
		if (value) {
			if ((value as any).length > 0) {
				const _value = (value as any).map((item: any) => {
					const { asset } = (item as unknown) as { asset: { amount: number } };
					const _item = {
						...item,
						fee: (item as { fee: number }).fee.toString(),
						asset: { ...asset, amount: asset.amount.toString() },
					};

					return _item;
				});

				localStorage.setItem(localStorageKey, JSON.stringify(_value));
			} else localStorage.setItem(localStorageKey, JSON.stringify(value));
		}
	}, [value]);

	return [value, setValue];
};

export default useStateWithLocalStorage;
