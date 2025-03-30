export class ComfyApis {

    public static async fetchWorkflows(comfyURL: string, usertokens?: string): Promise<string[]> {
        const url = new URL('/api/userdata', comfyURL);
        url.searchParams.append('dir', 'workflows');
        url.searchParams.append('recurse', 'true');
        url.searchParams.append('split', 'false');
        url.searchParams.append('full_info', 'true');
        const headers = new Headers();
        usertokens && headers.set('comfy-user', usertokens);

        try {
            const response = await fetch(url.toString(), {
                headers
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            // Extract all workflow paths
            const workflows = data.map((item: { path: string }) => item.path.replace('workflows/', ''));
            try {
                // Attempt to fetch and apply favorites
                const favoritesResponse = await fetch(
                    new URL('/api/userdata/workflows%2F.index.json', comfyURL).toString(), {
                    headers
                });
                if (favoritesResponse.ok) {
                    const favoritesData = await favoritesResponse.json();
                    const favorites = favoritesData.favorites.map((fav: string) => fav.replace('workflows/', ''));

                    workflows.sort((a: string, b: string) => {
                        const aIsFavorite = favorites.includes(a);
                        const bIsFavorite = favorites.includes(b);
                        if (aIsFavorite && !bIsFavorite) return -1;
                        if (!aIsFavorite && bIsFavorite) return 1;
                        return 0;
                    });
                }
            } catch (error) {
                console.warn('Error fetching favorites, returning unsorted workflows:', error);
            }

            return workflows;
        } catch (error) {
            console.error('Error fetching workflows:', error);
            throw error;
        }
    }
}
