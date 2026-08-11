using Microsoft.AspNetCore.Mvc.ModelBinding;

namespace CASE_STUDY_7.ModelBinders
{
    public class IntListBinder : IModelBinder
    {
        public Task BindModelAsync(ModelBindingContext context)
        {
            var value = context.ValueProvider
                .GetValue(context.ModelName)
                .FirstValue;

            if (string.IsNullOrWhiteSpace(value))
                return Task.CompletedTask;

            var intIds = value.Split(',', StringSplitOptions.RemoveEmptyEntries)
                              .Select(x => x.Trim())
                              .Select(x => int.TryParse(x, out int result) ? result : (int?)null)
                              .Where(x => x.HasValue)
                              .Select(x => x!.Value)
                              .ToList();
            Console.WriteLine(intIds.ToString());

            context.Result = ModelBindingResult.Success(intIds);
            return Task.CompletedTask;
        }
    }
}