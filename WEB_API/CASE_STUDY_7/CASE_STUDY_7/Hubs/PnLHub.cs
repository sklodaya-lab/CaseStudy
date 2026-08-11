using Microsoft.AspNetCore.SignalR;
using System.Text.RegularExpressions;

namespace CASE_STUDY_7.Hubs
{
    public class PnLHub : Hub
    {
        public override async Task OnConnectedAsync()
        {
            await base.OnConnectedAsync();
        }

        // Executes when a client disconnects or closes their tab
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            await base.OnDisconnectedAsync(exception);
        }

        // Optional: Allows clients to subscribe to updates for a specific security group
        public async Task SubscribeToSecurity(string securityId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, securityId);
        }
    }
}
